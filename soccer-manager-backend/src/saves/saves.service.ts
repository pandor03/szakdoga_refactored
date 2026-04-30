import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { compare, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SavesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(body: { email: string; username: string; password: string }) {
    const existingUserByEmail = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (existingUserByEmail) {
      throw new BadRequestException('A user with this email already exists');
    }

    const existingUserByUsername = await this.prisma.user.findUnique({
      where: {
        username: body.username,
      },
    });

    if (existingUserByUsername) {
      throw new BadRequestException('A user with this username already exists');
    }

    const passwordHash = await hash(body.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: body.email,
        username: body.username,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'User created successfully',
      user: this.sanitizeUser(user),
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    const passwordMatches = await compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new BadRequestException('Invalid email or password');
    }

    const userProfile = this.sanitizeUser(user);

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    return {
      message: 'Login successful',
      accessToken,
      user: userProfile,
    };
  }

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const saveCount = await this.prisma.gameSave.count({
      where: {
        userId,
      },
    });

    return {
      user: this.sanitizeUser(user),
      saveCount,
    };
  }

  async getAuthenticatedUserProfile(userId: string) {
    return this.getUserProfile(userId);
  }

  async createGameSave(
    userId: string,
    name: string,
    selectedBaseTeamShortName: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!name?.trim()) {
      throw new BadRequestException('Save name is required');
    }

    if (!selectedBaseTeamShortName?.trim()) {
      throw new BadRequestException('selectedTeamShortName is required');
    }

    const baseSelectedTeam = await this.prisma.baseTeam.findUnique({
      where: {
        shortName: selectedBaseTeamShortName,
      },
    });

    if (!baseSelectedTeam) {
      throw new BadRequestException('Selected base team not found');
    }

    const gameSave = await this.prisma.gameSave.create({
      data: {
        name,
        userId,
      },
    });

    const baseLeagues = await this.prisma.baseLeague.findMany();
    const createdSaveLeagues = new Map<string, string>();

    for (const baseLeague of baseLeagues) {
      const saveLeague = await this.prisma.saveLeague.create({
        data: {
          name: baseLeague.name,
          country: baseLeague.country,
          season: baseLeague.season,
          gameSaveId: gameSave.id,
        },
      });

      createdSaveLeagues.set(baseLeague.id, saveLeague.id);
    }

    const baseTeams = await this.prisma.baseTeam.findMany({
      include: {
        players: true,
      },
    });

    const createdSaveTeams = new Map<string, string>();

    for (const baseTeam of baseTeams) {
      const saveTeam = await this.prisma.saveTeam.create({
        data: {
          name: baseTeam.name,
          shortName: baseTeam.shortName,
          formation: '4-3-3',
          balance: 50000000,
          budget: 100000000,
          gameSaveId: gameSave.id,
          saveLeagueId: baseTeam.leagueId
            ? createdSaveLeagues.get(baseTeam.leagueId)
            : null,
        },
      });
      createdSaveTeams.set(baseTeam.id, saveTeam.id);
    }

    const selectedSaveTeamId = createdSaveTeams.get(baseSelectedTeam.id);

    if (!selectedSaveTeamId) {
      throw new BadRequestException('Selected save team could not be created');
    }

    await this.prisma.gameSave.update({
      where: {
        id: gameSave.id,
      },
      data: {
        selectedTeamId: selectedSaveTeamId,
      },
    });

    for (const [, saveTeamId] of createdSaveTeams) {
      await this.prisma.saveStanding.create({
        data: {
          gameSaveId: gameSave.id,
          saveTeamId,
        },
      });
    }

    for (const baseTeam of baseTeams) {
      const saveTeamId = createdSaveTeams.get(baseTeam.id);

      if (!saveTeamId) {
        continue;
      }

      if (baseTeam.players.length > 0) {
        const lineupSlotCounters: Record<string, number> = {};

        await this.prisma.savePlayer.createMany({
          data: baseTeam.players.map((player) => ({
            name: player.name,
            age: player.age,
            position: player.position,
            overall: player.overall,
            pace: player.pace,
            shooting: player.shooting,
            passing: player.passing,
            dribbling: player.dribbling,
            defending: player.defending,
            physical: player.physical,
            role: player.role,
            lineupPosition: player.lineupPosition,
            lineupSlot: this.getInitialLineupSlot(player.lineupPosition, lineupSlotCounters),
            marketValue: player.marketValue,
            isTransferListed: false,
            gameSaveId: gameSave.id,
            saveTeamId,
          })),
        });
      }
    }

    const baseFixtureTemplates = await this.prisma.baseFixtureTemplate.findMany();

    for (const template of baseFixtureTemplates) {
      const saveLeagueId = createdSaveLeagues.get(template.leagueId);
      const homeTeamId = createdSaveTeams.get(template.homeTeamId);
      const awayTeamId = createdSaveTeams.get(template.awayTeamId);

      if (!saveLeagueId || !homeTeamId || !awayTeamId) {
        continue;
      }

      await this.prisma.saveFixture.create({
        data: {
          roundNumber: template.roundNumber,
          gameSaveId: gameSave.id,
          saveLeagueId,
          homeTeamId,
          awayTeamId,
        },
      });
    }

    const totalPlayersCopied = baseTeams.reduce(
      (sum, team) => sum + team.players.length,
      0,
    );

    const updatedGameSave = await this.prisma.gameSave.findUnique({
      where: {
        id: gameSave.id,
      },
    });

    return {
      gameSave: updatedGameSave,
      selectedTeam: {
        id: selectedSaveTeamId,
        name: baseSelectedTeam.name,
        shortName: baseSelectedTeam.shortName,
      },
      copiedLeagues: baseLeagues.length,
      copiedTeams: baseTeams.length,
      copiedPlayers: totalPlayersCopied,
      copiedFixtures: baseFixtureTemplates.length,
    };
  }

  async listUserSaves(userId: string) {
    const saves = await this.prisma.gameSave.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        currentRound: true,
        selectedTeamId: true,
      },
    });

    const saveIds = saves.map((save) => save.id);

    const [selectedTeams, fixtureCounts, playedFixtureCounts] = await Promise.all([
      this.prisma.saveTeam.findMany({
        where: {
          gameSaveId: {
            in: saveIds,
          },
        },
        select: {
          id: true,
          name: true,
          shortName: true,
          formation: true,
          gameSaveId: true,
        },
      }),
      this.prisma.saveFixture.groupBy({
        by: ['gameSaveId'],
        where: {
          gameSaveId: {
            in: saveIds,
          },
        },
        _count: {
          _all: true,
        },
      }),
      this.prisma.saveFixture.groupBy({
        by: ['gameSaveId'],
        where: {
          gameSaveId: {
            in: saveIds,
          },
          matchResult: {
            isNot: null,
          },
        },
        _count: {
          _all: true,
        },
      }),
    ]);

    const selectedTeamById = new Map(selectedTeams.map((team) => [team.id, team]));
    const fixtureCountBySaveId = new Map(
      fixtureCounts.map((item) => [item.gameSaveId, item._count._all]),
    );
    const playedFixtureCountBySaveId = new Map(
      playedFixtureCounts.map((item) => [item.gameSaveId, item._count._all]),
    );

    return saves.map((save) => {
      const selectedTeam = save.selectedTeamId
        ? selectedTeamById.get(save.selectedTeamId) ?? null
        : null;

      const totalFixtures = fixtureCountBySaveId.get(save.id) ?? 0;
      const playedFixtures = playedFixtureCountBySaveId.get(save.id) ?? 0;
      const isFinished = totalFixtures > 0 && playedFixtures === totalFixtures;

      return {
        id: save.id,
        name: save.name,
        createdAt: save.createdAt,
        updatedAt: save.updatedAt,
        currentRound: save.currentRound,
        isFinished,
        selectedTeam: selectedTeam
          ? {
              id: selectedTeam.id,
              name: selectedTeam.name,
              shortName: selectedTeam.shortName,
              formation: selectedTeam.formation,
            }
          : null,
        progress: {
          playedFixtures,
          totalFixtures,
        },
      };
    });
  }

  async renameSave(userId: string, saveId: string, name: string) {
    await this.getRequiredOwnedGameSave(userId, saveId);

    if (!name?.trim()) {
      throw new BadRequestException('New save name is required');
    }

    const updatedSave = await this.prisma.gameSave.update({
      where: {
        id: saveId,
      },
      data: {
        name: name.trim(),
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        currentRound: true,
      },
    });

    return {
      message: 'Save renamed successfully',
      save: updatedSave,
    };
  }

  async deleteSave(userId: string, saveId: string) {
    const save = await this.getRequiredOwnedGameSave(userId, saveId);

    await this.prisma.matchResult.deleteMany({
      where: {
        gameSaveId: save.id,
      },
    });

    await this.prisma.saveStanding.deleteMany({
      where: {
        gameSaveId: save.id,
      },
    });

    await this.prisma.transferHistory.deleteMany({
      where: {
        gameSaveId: save.id,
      },
    });

    await this.prisma.saveFixture.deleteMany({
      where: {
        gameSaveId: save.id,
      },
    });

    await this.prisma.savePlayer.deleteMany({
      where: {
        gameSaveId: save.id,
      },
    });

    await this.prisma.saveTeam.deleteMany({
      where: {
        gameSaveId: save.id,
      },
    });

    await this.prisma.saveLeague.deleteMany({
      where: {
        gameSaveId: save.id,
      },
    });

    await this.prisma.gameSave.delete({
      where: {
        id: save.id,
      },
    });

    return {
      message: 'Save deleted successfully',
      deletedSaveId: save.id,
    };
  }

  private async getRequiredOwnedGameSave(userId: string, saveId: string) {
    const save = await this.prisma.gameSave.findFirst({
      where: {
        id: saveId,
        userId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        selectedTeamId: true,
        currentRound: true,
      },
    });

    if (!save) {
      throw new BadRequestException('Game save not found for this user');
    }

    return save;
  }

  private async getGameSaveTotalRounds(saveId: string) {
    const lastFixture = await this.prisma.saveFixture.findFirst({
      where: {
        gameSaveId: saveId,
      },
      orderBy: {
        roundNumber: 'desc',
      },
      select: {
        roundNumber: true,
      },
    });

    if (!lastFixture) {
      return 0;
    }

    return lastFixture.roundNumber;
  }

  private getInitialLineupSlot(
    lineupPosition: string | null,
    counters: Record<string, number>,
  ) {
    if (!lineupPosition) return null;

    counters[lineupPosition] = (counters[lineupPosition] ?? 0) + 1;
    const index = counters[lineupPosition];

    if (lineupPosition === 'GK') return index === 1 ? 'GK' : null;
    if (lineupPosition === 'LB') return index === 1 ? 'LB' : null;
    if (lineupPosition === 'RB') return index === 1 ? 'RB' : null;
    if (lineupPosition === 'CDM') return index === 1 ? 'CDM' : null;
    if (lineupPosition === 'CAM') return index === 1 ? 'CAM' : null;
    if (lineupPosition === 'LW') return index === 1 ? 'LW' : null;
    if (lineupPosition === 'RW') return index === 1 ? 'RW' : null;
    if (lineupPosition === 'ST') return index === 1 ? 'ST' : null;

    if (lineupPosition === 'CB') {
      if (index === 1) return 'CB1';
      if (index === 2) return 'CB2';
      if (index === 3) return 'CB3';
      return null;
    }

    if (lineupPosition === 'CM') {
      if (index === 1) return 'CM1';
      if (index === 2) return 'CM2';
      return null;
    }

    return null;
  }

  private sanitizeUser(user: {
    id: string;
    email: string;
    username: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}