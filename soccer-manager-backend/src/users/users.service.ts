import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PlayerPosition,
  SupportedFormation,
  SUPPORTED_FORMATIONS,
  getFitLabel,
  getFormationSlots,
  getPositionCompatibilityMultiplier,
  getSlotDefinition,
  isSupportedFormation,
} from './lineup.config';
import { compare, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private getDemoBasePlayersForTeam(teamId: string, shortName: string) {
    const playersByTeam: Record<string, Array<any>> = {
      BAR: [
        { name: 'Ter Stegen', age: 32, position: 'GK', overall: 88, pace: 50, shooting: 18, passing: 85, dribbling: 81, defending: 20, physical: 78, role: 'starter', lineupPosition: 'GK', marketValue: 35000000 },
        { name: 'Balde', age: 21, position: 'LB', overall: 81, pace: 91, shooting: 55, passing: 74, dribbling: 79, defending: 76, physical: 74, role: 'starter', lineupPosition: 'LB', marketValue: 40000000 },
        { name: 'Araujo', age: 25, position: 'CB', overall: 86, pace: 78, shooting: 50, passing: 71, dribbling: 68, defending: 87, physical: 86, role: 'starter', lineupPosition: 'CB', marketValue: 70000000 },
        { name: 'Kounde', age: 25, position: 'CB', overall: 85, pace: 80, shooting: 45, passing: 78, dribbling: 76, defending: 85, physical: 79, role: 'starter', lineupPosition: 'CB', marketValue: 65000000 },
        { name: 'Cancelo', age: 30, position: 'RB', overall: 84, pace: 81, shooting: 73, passing: 82, dribbling: 84, defending: 78, physical: 73, role: 'starter', lineupPosition: 'RB', marketValue: 30000000 },
        { name: 'De Jong', age: 27, position: 'CDM', overall: 87, pace: 80, shooting: 70, passing: 88, dribbling: 87, defending: 80, physical: 78, role: 'starter', lineupPosition: 'CDM', marketValue: 80000000 },
        { name: 'Pedri', age: 21, position: 'CM', overall: 86, pace: 78, shooting: 74, passing: 88, dribbling: 89, defending: 70, physical: 72, role: 'starter', lineupPosition: 'CM', marketValue: 80000000 },
        { name: 'Gavi', age: 20, position: 'CM', overall: 84, pace: 76, shooting: 72, passing: 84, dribbling: 86, defending: 74, physical: 76, role: 'starter', lineupPosition: 'CM', marketValue: 70000000 },
        { name: 'Gundogan', age: 33, position: 'CAM', overall: 85, pace: 64, shooting: 80, passing: 87, dribbling: 84, defending: 68, physical: 70, role: 'starter', lineupPosition: 'CAM', marketValue: 22000000 },
        { name: 'Raphinha', age: 27, position: 'RW', overall: 84, pace: 86, shooting: 80, passing: 81, dribbling: 85, defending: 48, physical: 69, role: 'starter', lineupPosition: 'RW', marketValue: 50000000 },
        { name: 'Lewandowski', age: 35, position: 'ST', overall: 88, pace: 75, shooting: 90, passing: 78, dribbling: 84, defending: 40, physical: 82, role: 'starter', lineupPosition: 'ST', marketValue: 45000000 },
        { name: 'Joao Felix', age: 24, position: 'LW', overall: 83, pace: 84, shooting: 80, passing: 79, dribbling: 86, defending: 35, physical: 66, role: 'bench', lineupPosition: null, marketValue: 40000000 },
        { name: 'Ferran Torres', age: 24, position: 'LW', overall: 82, pace: 84, shooting: 79, passing: 75, dribbling: 82, defending: 38, physical: 69, role: 'bench', lineupPosition: null, marketValue: 35000000 },
        { name: 'Inaki Pena', age: 25, position: 'GK', overall: 76, pace: 48, shooting: 14, passing: 70, dribbling: 65, defending: 18, physical: 70, role: 'bench', lineupPosition: null, marketValue: 8000000 },
        { name: 'Christensen', age: 28, position: 'CB', overall: 82, pace: 69, shooting: 42, passing: 77, dribbling: 70, defending: 84, physical: 74, role: 'bench', lineupPosition: null, marketValue: 30000000 },
      ],
      RMA: [
        { name: 'Courtois', age: 32, position: 'GK', overall: 89, pace: 46, shooting: 17, passing: 76, dribbling: 72, defending: 22, physical: 81, role: 'starter', lineupPosition: 'GK', marketValue: 35000000 },
        { name: 'Mendy', age: 29, position: 'LB', overall: 82, pace: 84, shooting: 50, passing: 74, dribbling: 77, defending: 81, physical: 79, role: 'starter', lineupPosition: 'LB', marketValue: 28000000 },
        { name: 'Rudiger', age: 31, position: 'CB', overall: 86, pace: 78, shooting: 49, passing: 73, dribbling: 68, defending: 86, physical: 86, role: 'starter', lineupPosition: 'CB', marketValue: 32000000 },
        { name: 'Militao', age: 26, position: 'CB', overall: 85, pace: 80, shooting: 42, passing: 74, dribbling: 70, defending: 85, physical: 84, role: 'starter', lineupPosition: 'CB', marketValue: 55000000 },
        { name: 'Carvajal', age: 32, position: 'RB', overall: 83, pace: 78, shooting: 62, passing: 78, dribbling: 79, defending: 81, physical: 77, role: 'starter', lineupPosition: 'RB', marketValue: 18000000 },
        { name: 'Tchouameni', age: 24, position: 'CDM', overall: 85, pace: 76, shooting: 69, passing: 80, dribbling: 78, defending: 84, physical: 84, role: 'starter', lineupPosition: 'CDM', marketValue: 90000000 },
        { name: 'Valverde', age: 25, position: 'CM', overall: 87, pace: 86, shooting: 80, passing: 83, dribbling: 82, defending: 78, physical: 84, role: 'starter', lineupPosition: 'CM', marketValue: 100000000 },
        { name: 'Bellingham', age: 20, position: 'CAM', overall: 88, pace: 79, shooting: 82, passing: 84, dribbling: 86, defending: 78, physical: 82, role: 'starter', lineupPosition: 'CAM', marketValue: 100000000 },
        { name: 'Vinicius Jr', age: 23, position: 'LW', overall: 89, pace: 95, shooting: 84, passing: 79, dribbling: 92, defending: 35, physical: 70, role: 'starter', lineupPosition: 'LW', marketValue: 120000000 },
        { name: 'Rodrygo', age: 23, position: 'RW', overall: 85, pace: 88, shooting: 81, passing: 79, dribbling: 87, defending: 40, physical: 67, role: 'starter', lineupPosition: 'RW', marketValue: 90000000 },
        { name: 'Joselu', age: 34, position: 'ST', overall: 81, pace: 65, shooting: 83, passing: 68, dribbling: 72, defending: 35, physical: 81, role: 'starter', lineupPosition: 'ST', marketValue: 8000000 },
        { name: 'Lunin', age: 25, position: 'GK', overall: 79, pace: 47, shooting: 13, passing: 72, dribbling: 68, defending: 19, physical: 74, role: 'bench', lineupPosition: null, marketValue: 12000000 },
        { name: 'Camavinga', age: 21, position: 'CM', overall: 84, pace: 81, shooting: 70, passing: 82, dribbling: 84, defending: 79, physical: 79, role: 'bench', lineupPosition: null, marketValue: 85000000 },
        { name: 'Alaba', age: 31, position: 'CB', overall: 84, pace: 71, shooting: 71, passing: 83, dribbling: 76, defending: 84, physical: 76, role: 'bench', lineupPosition: null, marketValue: 20000000 },
        { name: 'Brahim Diaz', age: 24, position: 'CAM', overall: 82, pace: 83, shooting: 78, passing: 79, dribbling: 86, defending: 40, physical: 63, role: 'bench', lineupPosition: null, marketValue: 30000000 },
      ],
      MCI: [
        { name: 'Ederson', age: 30, position: 'GK', overall: 88, pace: 51, shooting: 18, passing: 86, dribbling: 80, defending: 18, physical: 78, role: 'starter', lineupPosition: 'GK', marketValue: 35000000 },
        { name: 'Gvardiol', age: 22, position: 'LB', overall: 84, pace: 78, shooting: 62, passing: 79, dribbling: 77, defending: 83, physical: 82, role: 'starter', lineupPosition: 'LB', marketValue: 75000000 },
        { name: 'Dias', age: 27, position: 'CB', overall: 88, pace: 68, shooting: 50, passing: 80, dribbling: 72, defending: 89, physical: 84, role: 'starter', lineupPosition: 'CB', marketValue: 80000000 },
        { name: 'Akanji', age: 28, position: 'CB', overall: 84, pace: 73, shooting: 45, passing: 78, dribbling: 73, defending: 84, physical: 80, role: 'starter', lineupPosition: 'CB', marketValue: 40000000 },
        { name: 'Walker', age: 34, position: 'RB', overall: 83, pace: 91, shooting: 54, passing: 76, dribbling: 74, defending: 80, physical: 79, role: 'starter', lineupPosition: 'RB', marketValue: 12000000 },
        { name: 'Rodri', age: 27, position: 'CDM', overall: 89, pace: 66, shooting: 78, passing: 86, dribbling: 80, defending: 87, physical: 84, role: 'starter', lineupPosition: 'CDM', marketValue: 110000000 },
        { name: 'De Bruyne', age: 32, position: 'CM', overall: 90, pace: 67, shooting: 86, passing: 94, dribbling: 87, defending: 64, physical: 78, role: 'starter', lineupPosition: 'CM', marketValue: 70000000 },
        { name: 'Bernardo Silva', age: 29, position: 'CAM', overall: 88, pace: 78, shooting: 79, passing: 89, dribbling: 92, defending: 63, physical: 71, role: 'starter', lineupPosition: 'CAM', marketValue: 80000000 },
        { name: 'Doku', age: 22, position: 'LW', overall: 82, pace: 93, shooting: 74, passing: 73, dribbling: 89, defending: 37, physical: 66, role: 'starter', lineupPosition: 'LW', marketValue: 55000000 },
        { name: 'Foden', age: 24, position: 'RW', overall: 88, pace: 84, shooting: 85, passing: 86, dribbling: 90, defending: 56, physical: 66, role: 'starter', lineupPosition: 'RW', marketValue: 130000000 },
        { name: 'Haaland', age: 23, position: 'ST', overall: 91, pace: 89, shooting: 93, passing: 66, dribbling: 80, defending: 45, physical: 90, role: 'starter', lineupPosition: 'ST', marketValue: 150000000 },
        { name: 'Ortega', age: 31, position: 'GK', overall: 80, pace: 46, shooting: 12, passing: 72, dribbling: 67, defending: 18, physical: 72, role: 'bench', lineupPosition: null, marketValue: 9000000 },
        { name: 'Kovacic', age: 30, position: 'CM', overall: 83, pace: 72, shooting: 73, passing: 84, dribbling: 86, defending: 72, physical: 72, role: 'bench', lineupPosition: null, marketValue: 30000000 },
        { name: 'Grealish', age: 28, position: 'LW', overall: 84, pace: 78, shooting: 77, passing: 82, dribbling: 88, defending: 45, physical: 69, role: 'bench', lineupPosition: null, marketValue: 55000000 },
        { name: 'Stones', age: 30, position: 'CB', overall: 85, pace: 70, shooting: 57, passing: 83, dribbling: 75, defending: 85, physical: 78, role: 'bench', lineupPosition: null, marketValue: 38000000 },
      ],
      BAY: [
        { name: 'Neuer', age: 38, position: 'GK', overall: 87, pace: 49, shooting: 17, passing: 84, dribbling: 78, defending: 18, physical: 76, role: 'starter', lineupPosition: 'GK', marketValue: 12000000 },
        { name: 'Davies', age: 23, position: 'LB', overall: 84, pace: 95, shooting: 67, passing: 77, dribbling: 83, defending: 78, physical: 79, role: 'starter', lineupPosition: 'LB', marketValue: 70000000 },
        { name: 'De Ligt', age: 24, position: 'CB', overall: 85, pace: 67, shooting: 55, passing: 73, dribbling: 69, defending: 86, physical: 84, role: 'starter', lineupPosition: 'CB', marketValue: 65000000 },
        { name: 'Upamecano', age: 25, position: 'CB', overall: 83, pace: 80, shooting: 44, passing: 72, dribbling: 68, defending: 83, physical: 84, role: 'starter', lineupPosition: 'CB', marketValue: 50000000 },
        { name: 'Mazraoui', age: 26, position: 'RB', overall: 81, pace: 79, shooting: 65, passing: 79, dribbling: 82, defending: 77, physical: 72, role: 'starter', lineupPosition: 'RB', marketValue: 28000000 },
        { name: 'Kimmich', age: 29, position: 'CDM', overall: 88, pace: 68, shooting: 76, passing: 89, dribbling: 84, defending: 82, physical: 77, role: 'starter', lineupPosition: 'CDM', marketValue: 75000000 },
        { name: 'Goretzka', age: 29, position: 'CM', overall: 85, pace: 72, shooting: 80, passing: 82, dribbling: 79, defending: 76, physical: 84, role: 'starter', lineupPosition: 'CM', marketValue: 45000000 },
        { name: 'Musiala', age: 21, position: 'CAM', overall: 87, pace: 84, shooting: 79, passing: 83, dribbling: 91, defending: 58, physical: 68, role: 'starter', lineupPosition: 'CAM', marketValue: 110000000 },
        { name: 'Coman', age: 28, position: 'LW', overall: 84, pace: 91, shooting: 76, passing: 78, dribbling: 86, defending: 36, physical: 67, role: 'starter', lineupPosition: 'LW', marketValue: 50000000 },
        { name: 'Sane', age: 28, position: 'RW', overall: 85, pace: 90, shooting: 80, passing: 79, dribbling: 86, defending: 41, physical: 69, role: 'starter', lineupPosition: 'RW', marketValue: 60000000 },
        { name: 'Kane', age: 30, position: 'ST', overall: 90, pace: 69, shooting: 92, passing: 84, dribbling: 83, defending: 49, physical: 82, role: 'starter', lineupPosition: 'ST', marketValue: 90000000 },
        { name: 'Ulreich', age: 35, position: 'GK', overall: 76, pace: 42, shooting: 10, passing: 68, dribbling: 62, defending: 15, physical: 68, role: 'bench', lineupPosition: null, marketValue: 2000000 },
        { name: 'Laimer', age: 27, position: 'CM', overall: 82, pace: 80, shooting: 72, passing: 77, dribbling: 79, defending: 76, physical: 81, role: 'bench', lineupPosition: null, marketValue: 25000000 },
        { name: 'Gnabry', age: 28, position: 'LW', overall: 83, pace: 85, shooting: 80, passing: 76, dribbling: 83, defending: 39, physical: 71, role: 'bench', lineupPosition: null, marketValue: 35000000 },
        { name: 'Kim Min-jae', age: 27, position: 'CB', overall: 84, pace: 74, shooting: 38, passing: 71, dribbling: 66, defending: 85, physical: 84, role: 'bench', lineupPosition: null, marketValue: 50000000 },
      ],
    };

    const players = playersByTeam[shortName];

    if (!players) {
      throw new Error(`No demo players configured for team ${shortName}`);
    }

    return players.map((player) => ({
      ...player,
      teamId,
    }));
  }

  private async ensureDemoWorldIsEmpty() {
    const [teamCount, leagueCount, playerCount, fixtureTemplateCount] =
      await Promise.all([
        this.prisma.baseTeam.count(),
        this.prisma.baseLeague.count(),
        this.prisma.basePlayer.count(),
        this.prisma.baseFixtureTemplate.count(),
      ]);

    if (
      teamCount > 0 ||
      leagueCount > 0 ||
      playerCount > 0 ||
      fixtureTemplateCount > 0
    ) {
      throw new BadRequestException(
        'Demo base world is not empty. Use /users/seed/reset-demo-world first.',
      );
    }
  }


  async getSaveTeams(gameSaveId: string) {
    return this.prisma.saveTeam.findMany({
      where: {
        gameSaveId,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getBaseTeamsWithPlayers() {
    return this.prisma.baseTeam.findMany({
      include: {
        players: true,
      },
    });
  }

  async seedBasePlayers() {
    const existingPlayerCount = await this.prisma.basePlayer.count();

    if (existingPlayerCount > 0) {
      throw new BadRequestException(
        'Base players already exist. Reset the demo world first if you want to reseed.',
      );
    }

    const teams = await this.prisma.baseTeam.findMany({
      orderBy: {
        shortName: 'asc',
      },
    });

    if (teams.length === 0) {
      throw new BadRequestException('Seed base teams first');
    }

    const allPlayers = teams.flatMap((team) =>
      this.getDemoBasePlayersForTeam(team.id, team.shortName),
    );

    await this.prisma.basePlayer.createMany({
      data: allPlayers,
    });

    return {
      message: 'Base players seeded successfully',
      playerCount: allPlayers.length,
      teamCount: teams.length,
      averagePlayersPerTeam: allPlayers.length / teams.length,
    };
  }

  async seedBaseTeams() {
    const existingCount = await this.prisma.baseTeam.count();

    if (existingCount > 0) {
      throw new BadRequestException(
        'Base teams already exist. Reset the demo world first if you want to reseed.',
      );
    }

    await this.prisma.baseTeam.createMany({
      data: [
        { name: 'FC Barcelona', shortName: 'BAR' },
        { name: 'Real Madrid', shortName: 'RMA' },
        { name: 'Manchester City', shortName: 'MCI' },
        { name: 'Bayern Munich', shortName: 'BAY' },
      ],
    });

    return {
      message: 'Base teams seeded successfully',
      teamCount: 4,
    };
  }


  async getSaveTeamsWithPlayers(gameSaveId: string) {
    return this.prisma.saveTeam.findMany({
      where: {
        gameSaveId,
      },
      include: {
        players: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async seedBaseLeague() {
    const existingLeagueCount = await this.prisma.baseLeague.count();

    if (existingLeagueCount > 0) {
      throw new BadRequestException(
        'Base league already exists. Reset the demo world first if you want to reseed.',
      );
    }

    const existingTeamCount = await this.prisma.baseTeam.count();

    if (existingTeamCount === 0) {
      throw new BadRequestException('Seed base teams first');
    }

    const league = await this.prisma.baseLeague.create({
      data: {
        name: 'La Liga Demo',
        country: 'Spain',
        season: '2026/2027',
      },
    });

    await this.prisma.baseTeam.updateMany({
      where: {
        shortName: {
          in: ['BAR', 'RMA', 'MCI', 'BAY'],
        },
      },
      data: {
        leagueId: league.id,
      },
    });

    return {
      message: 'Base league seeded successfully',
      league,
    };
  }

  async getBaseLeaguesWithTeams() {
    return this.prisma.baseLeague.findMany({
      include: {
        teams: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getSaveLeaguesWithTeams(gameSaveId: string) {
    return this.prisma.saveLeague.findMany({
      where: {
        gameSaveId,
      },
      include: {
        teams: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async seedBaseFixtureTemplates() {
    const existingTemplateCount = await this.prisma.baseFixtureTemplate.count();

    if (existingTemplateCount > 0) {
      throw new BadRequestException(
        'Base fixture templates already exist. Reset the demo world first if you want to reseed.',
      );
    }

    const league = await this.prisma.baseLeague.findFirst({
      where: {
        name: 'La Liga Demo',
      },
    });

    if (!league) {
      throw new BadRequestException('Seed base league first');
    }

    const teams = await this.prisma.baseTeam.findMany({
      where: {
        leagueId: league.id,
      },
      orderBy: {
        shortName: 'asc',
      },
    });

    const bar = teams.find((t) => t.shortName === 'BAR');
    const rma = teams.find((t) => t.shortName === 'RMA');
    const mci = teams.find((t) => t.shortName === 'MCI');
    const bay = teams.find((t) => t.shortName === 'BAY');

    if (!bar || !rma || !mci || !bay) {
      throw new BadRequestException('Not all base teams were found in the base league');
    }

    await this.prisma.baseFixtureTemplate.createMany({
      data: [
        { roundNumber: 1, homeTeamId: bar.id, awayTeamId: rma.id, leagueId: league.id },
        { roundNumber: 1, homeTeamId: mci.id, awayTeamId: bay.id, leagueId: league.id },

        { roundNumber: 2, homeTeamId: bar.id, awayTeamId: mci.id, leagueId: league.id },
        { roundNumber: 2, homeTeamId: rma.id, awayTeamId: bay.id, leagueId: league.id },

        { roundNumber: 3, homeTeamId: bar.id, awayTeamId: bay.id, leagueId: league.id },
        { roundNumber: 3, homeTeamId: rma.id, awayTeamId: mci.id, leagueId: league.id },
      ],
    });

    return {
      message: 'Base fixture templates seeded successfully',
      fixtureTemplateCount: 6,
    };
  }

  async getBaseLeaguesWithFixtureTemplates() {
    return this.prisma.baseLeague.findMany({
      include: {
        fixtureTemplates: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getSelectedTeamOverall(saveId: string) {
    const { selectedTeam } = await this.getRequiredSelectedTeam(saveId);
    const lineup = await this.getSelectedTeamLineup(saveId);
    const lineStrengths = this.calculateLineStrengthsFromLineup(lineup);
    const overall = this.calculateTeamOverallFromLineup(lineup);

    return {
      team: {
        id: selectedTeam.id,
        name: selectedTeam.name,
        shortName: selectedTeam.shortName,
        formation: selectedTeam.formation,
      },
      lineupOverall: overall,
      lineStrengths,
      starterEffectiveOveralls: lineup.lineup.slots.map((slot) => ({
        slotId: slot.slotId,
        tacticalPosition: slot.tacticalPosition,
        playerId: slot.player?.id ?? null,
        playerName: slot.player?.name ?? null,
        effectiveOverall: slot.player?.effectiveOverall ?? 0,
        multiplier: slot.player?.positionMultiplier ?? 0,
      })),
    };
  }

  async getSelectedTeamSummary(saveId: string) {
    const { selectedTeam } = await this.getRequiredSelectedTeam(saveId);

    const [standing, nextFixture, lineup, squadAggregates, overall] =
      await Promise.all([
        this.getSelectedTeamStanding(saveId),
        this.getSelectedTeamNextFixture(saveId).catch(() => null),
        this.getSelectedTeamLineup(saveId),
        this.getSelectedTeamSquadAggregates(saveId),
        this.getSelectedTeamOverall(saveId),
      ]);

    return {
      team: {
        id: selectedTeam.id,
        name: selectedTeam.name,
        shortName: selectedTeam.shortName,
        formation: selectedTeam.formation,
      },
      standing,
      nextFixture,
      squad: squadAggregates,
      lineup: {
        isCompleteLineup: lineup.lineup.isCompleteLineup,
        starterCount: lineup.lineup.starterCount,
        benchCount: lineup.lineup.benchCount,
        reserveCount: lineup.lineup.reserveCount,
      },
      overall: {
        lineupOverall: overall.lineupOverall,
        defense: overall.lineStrengths.defense,
        midfield: overall.lineStrengths.midfield,
        attack: overall.lineStrengths.attack,
      },
    };
  }

  async getSelectedTeamClubSnapshot(saveId: string) {
    const { gameSave, selectedTeam } = await this.getRequiredSelectedTeam(saveId);

    const [seasonState, summary, lineup, nextMatchContext, lastFixtures] =
      await Promise.all([
        this.getSeasonState(saveId),
        this.getSelectedTeamSummary(saveId),
        this.getSelectedTeamLineup(saveId),
        this.getSelectedTeamNextMatchContext(saveId).catch(() => null),
        this.getSelectedTeamLastFixtures(saveId).catch(() => []),
      ]);

    return {
      save: {
        id: gameSave.id,
        currentRound: gameSave.currentRound,
      },
      team: {
        id: selectedTeam.id,
        name: selectedTeam.name,
        shortName: selectedTeam.shortName,
        formation: selectedTeam.formation,
      },
      seasonState,
      summary,
      lineupPreview: lineup.lineup.slots.map((slot) => ({
        slotId: slot.slotId,
        tacticalPosition: slot.tacticalPosition,
        player: slot.player
          ? {
              id: slot.player.id,
              name: slot.player.name,
              position: slot.player.position,
              effectiveOverall: slot.player.effectiveOverall,
              fitLabel: slot.player.fitLabel,
            }
          : null,
      })),
      nextMatchContext,
      recentFixtures: lastFixtures.slice(0, 3),
    };
  }

  private roundToOne(value: number) {
    return Math.round(value * 10) / 10;
  }

  private safeAverage(numbers: number[]) {
    if (numbers.length === 0) {
      return 0;
    }

    return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
  }

  private calculateLineStrengthsFromLineup(
    lineup: Awaited<ReturnType<UsersService['getSelectedTeamLineup']>>,
  ) {
    const slots = lineup.lineup.slots;

    const defensivePositions: PlayerPosition[] = ['GK', 'LB', 'CB', 'RB'];
    const midfieldPositions: PlayerPosition[] = ['CDM', 'CM', 'CAM'];
    const attackingPositions: PlayerPosition[] = ['LW', 'RW', 'ST'];

    const defensiveValues = slots
      .filter((slot) =>
        defensivePositions.includes(slot.tacticalPosition as PlayerPosition),
      )
      .map((slot) => slot.player?.effectiveOverall ?? 0);

    const midfieldValues = slots
      .filter((slot) =>
        midfieldPositions.includes(slot.tacticalPosition as PlayerPosition),
      )
      .map((slot) => slot.player?.effectiveOverall ?? 0);

    const attackingValues = slots
      .filter((slot) =>
        attackingPositions.includes(slot.tacticalPosition as PlayerPosition),
      )
      .map((slot) => slot.player?.effectiveOverall ?? 0);

    return {
      defense: Math.round(this.safeAverage(defensiveValues)),
      midfield: Math.round(this.safeAverage(midfieldValues)),
      attack: Math.round(this.safeAverage(attackingValues)),
    };
  }

  private calculateTeamOverallFromLineup(
    lineup: Awaited<ReturnType<UsersService['getSelectedTeamLineup']>>,
  ) {
    const starterEffectiveOveralls = lineup.lineup.slots.map(
      (slot) => slot.player?.effectiveOverall ?? 0,
    );

    return Math.round(this.safeAverage(starterEffectiveOveralls));
  }

  private async getSelectedTeamSquadAggregates(saveId: string) {
    const { selectedTeam } = await this.getRequiredSelectedTeam(saveId);

    const players = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId: saveId,
        saveTeamId: selectedTeam.id,
      },
      select: {
        id: true,
        age: true,
        overall: true,
        marketValue: true,
        role: true,
        isTransferListed: true,
        position: true,
      },
    });

    const starters = players.filter((player) => player.role === 'starter');
    const bench = players.filter((player) => player.role === 'bench');
    const reserve = players.filter((player) => player.role === 'reserve');
    const transferListed = players.filter((player) => player.isTransferListed);

    const totalMarketValue = players.reduce(
      (sum, player) => sum + player.marketValue,
      0,
    );

    const positionCounts = players.reduce<Record<string, number>>(
      (acc, player) => {
        acc[player.position] = (acc[player.position] ?? 0) + 1;
        return acc;
      },
      {},
    );

    return {
      squadSize: players.length,
      starterCount: starters.length,
      benchCount: bench.length,
      reserveCount: reserve.length,
      transferListedCount: transferListed.length,
      averageAge: this.roundToOne(
        this.safeAverage(players.map((player) => player.age)),
      ),
      averageOverall: this.roundToOne(
        this.safeAverage(players.map((player) => player.overall)),
      ),
      starterAverageOverall: this.roundToOne(
        this.safeAverage(starters.map((player) => player.overall)),
      ),
      totalMarketValue,
      positionCounts,
    };
  }
  
  async getSaveFixtures(gameSaveId: string) {
    return this.prisma.saveFixture.findMany({
      where: {
        gameSaveId,
      },
      include: {
        matchResult: true,
      },
      orderBy: [
        {
          roundNumber: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],
    });
  }

  private async buildTeamLineupSnapshot(gameSaveId: string, saveTeamId: string) {
    const team = await this.prisma.saveTeam.findFirst({
      where: {
        id: saveTeamId,
        gameSaveId,
      },
      select: {
        id: true,
        name: true,
        shortName: true,
        formation: true,
      },
    });

    if (!team) {
      throw new BadRequestException('Team not found for match summary');
    }

    const formation = isSupportedFormation(team.formation)
      ? (team.formation as SupportedFormation)
      : '4-3-3';

    const players = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId,
        saveTeamId,
      },
      select: {
        id: true,
        name: true,
        age: true,
        position: true,
        overall: true,
        pace: true,
        shooting: true,
        passing: true,
        dribbling: true,
        defending: true,
        physical: true,
        role: true,
        lineupPosition: true,
        lineupSlot: true,
        isTransferListed: true,
        marketValue: true,
        saveTeamId: true,
        gameSaveId: true,
      },
      orderBy: [
        { overall: 'desc' },
        { name: 'asc' },
      ],
    });

    const slots = getFormationSlots(formation);
    const starters = players.filter((player) => player.role === 'starter');
    const bench = players.filter((player) => player.role === 'bench');

    const lineup = slots
      .map((slot) => {
        const player = starters.find((starter) => starter.lineupSlot === slot.slotId);

        if (!player) {
          return null;
        }

        const mappedPlayer = this.mapLineupPlayer(player, slot.tacticalPosition);

        return {
          ...mappedPlayer,
          playedPosition: slot.tacticalPosition,
          tacticalPosition: slot.tacticalPosition,
          lineupSlot: slot.slotId,
        };
      })
      .filter(Boolean);

    return {
      team,
      formation,
      lineup,
      bench: bench.map((player) =>
        this.mapLineupPlayer(player, player.position as PlayerPosition),
      ),
    };
  }

  private async buildMatchSummarySnapshot(
    gameSaveId: string,
    homeTeamId: string,
    awayTeamId: string,
  ) {
    const [homeSnapshot, awaySnapshot] = await Promise.all([
      this.buildTeamLineupSnapshot(gameSaveId, homeTeamId),
      this.buildTeamLineupSnapshot(gameSaveId, awayTeamId),
    ]);

    return {
      homeFormation: homeSnapshot.formation,
      awayFormation: awaySnapshot.formation,
      homeLineup: homeSnapshot.lineup,
      awayLineup: awaySnapshot.lineup,
      homeBench: homeSnapshot.bench,
      awayBench: awaySnapshot.bench,
      goalscorers: [],
      substitutions: [],
    };
  }

  async saveMatchResult(
    gameSaveId: string,
    saveFixtureId: string,
    homeGoals?: number,
    awayGoals?: number,
    snapshot?: {
      homeFormation?: string;
      awayFormation?: string;
      homeLineup?: any[];
      awayLineup?: any[];
      homeBench?: any[];
      awayBench?: any[];
      events?: any[];
    },
  ) {
    const fixture = await this.prisma.saveFixture.findUnique({
      where: {
        id: saveFixtureId,
      },
      include: {
        matchResult: true,
      },
    });
  
    if (!fixture) {
      throw new BadRequestException('Fixture not found');
    }

    if (fixture.matchResult) {
      throw new BadRequestException('Match result already exists for this fixture');
    }

    await this.ensureTeamLineupPersisted(gameSaveId, fixture.homeTeamId);
    await this.ensureTeamLineupPersisted(gameSaveId, fixture.awayTeamId);

    const simulation = await this.simulateFixtureScore(
      gameSaveId,
      fixture.homeTeamId,
      fixture.awayTeamId,
    );

    const finalHomeGoals = homeGoals ?? simulation.homeGoals;
    const finalAwayGoals = awayGoals ?? simulation.awayGoals;

    const homeSnapshot = await this.getTeamMatchSnapshot(
      gameSaveId,
      fixture.homeTeamId,
    );

    const awaySnapshot = await this.getTeamMatchSnapshot(
      gameSaveId,
      fixture.awayTeamId,
    );

    const goalscorers = [
      ...this.generateGoalEvents(finalHomeGoals, 'home', homeSnapshot.lineup),
      ...this.generateGoalEvents(finalAwayGoals, 'away', awaySnapshot.lineup),
    ].sort((a, b) => a.minute - b.minute);

    const substitutions = [
      ...this.generateSubstitutionEvents('home', homeSnapshot.lineup, homeSnapshot.bench),
      ...this.generateSubstitutionEvents('away', awaySnapshot.lineup, awaySnapshot.bench),
    ].sort((a, b) => a.minute - b.minute);

    const matchSummary = {
      homeFormation: homeSnapshot.formation,
      awayFormation: awaySnapshot.formation,
      homeLineup: homeSnapshot.lineup,
      awayLineup: awaySnapshot.lineup,
      homeBench: homeSnapshot.bench,
      awayBench: awaySnapshot.bench,
      goalscorers,
      substitutions,
    };

    const result = await this.prisma.matchResult.create({
      data: {
        gameSaveId,
        saveFixtureId,
        homeGoals: finalHomeGoals,
        awayGoals: finalAwayGoals,
        homeFormation: matchSummary.homeFormation,
        awayFormation: matchSummary.awayFormation,
        homeLineup: matchSummary.homeLineup,
        awayLineup: matchSummary.awayLineup,
        homeBench: matchSummary.homeBench,
        awayBench: matchSummary.awayBench,
        matchSummary,
      },
    });

    const homeStanding = await this.prisma.saveStanding.findUnique({
      where: {
        saveTeamId: fixture.homeTeamId,
      },
    });

    const awayStanding = await this.prisma.saveStanding.findUnique({
      where: {
        saveTeamId: fixture.awayTeamId,
      },
    });

    if (!homeStanding || !awayStanding) {
      throw new Error('Standing not found for one of the teams');
    }

    let homePoints = 0;
    let awayPoints = 0;
    let homeWins = 0;
    let awayWins = 0;
    let homeDraws = 0;
    let awayDraws = 0;
    let homeLosses = 0;
    let awayLosses = 0;

    if (finalHomeGoals > finalAwayGoals) {
      homePoints = 3;
      homeWins = 1;
      awayLosses = 1;
    } else if (finalHomeGoals < finalAwayGoals) {
      awayPoints = 3;
      awayWins = 1;
      homeLosses = 1;
    } else {
      homePoints = 1;
      awayPoints = 1;
      homeDraws = 1;
      awayDraws = 1;
    }

    await this.prisma.saveStanding.update({
      where: {
        saveTeamId: fixture.homeTeamId,
      },
      data: {
        played: { increment: 1 },
        wins: { increment: homeWins },
        draws: { increment: homeDraws },
        losses: { increment: homeLosses },
        goalsFor: { increment: finalHomeGoals },
        goalsAgainst: { increment: finalAwayGoals },
        points: { increment: homePoints },
      },
    });

    await this.prisma.saveStanding.update({
      where: {
        saveTeamId: fixture.awayTeamId,
      },
      data: {
        played: { increment: 1 },
        wins: { increment: awayWins },
        draws: { increment: awayDraws },
        losses: { increment: awayLosses },
        goalsFor: { increment: finalAwayGoals },
        goalsAgainst: { increment: finalHomeGoals },
        points: { increment: awayPoints },
      },
    });

    return result;
  }

  private async validateTeamHasCompleteLineup(
    gameSaveId: string,
    saveTeamId: string,
  ) {
    const starters = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId,
        saveTeamId,
        role: 'starter',
      },
      select: {
        id: true,
        name: true,
        lineupSlot: true,
        lineupPosition: true,
      },
    });

    const validStarters = starters.filter(
      (player) => player.lineupSlot && player.lineupPosition,
    );

    if (validStarters.length !== 11) {
      throw new BadRequestException(
        `Incomplete lineup: expected 11 starters with lineup slots, got ${validStarters.length}`,
      );
    }
  }

  async playRound(gameSaveId: string) {
    const gameSave = await this.prisma.gameSave.findUnique({
      where: {
        id: gameSaveId,
      },
    });

    if (!gameSave) {
      throw new BadRequestException('Game save not found');
    }

    const currentRound = gameSave.currentRound;

    await this.runBotAiBeforeRound(gameSaveId);

    const lastFixture = await this.prisma.saveFixture.findFirst({
      where: {
        gameSaveId,
      },
      orderBy: {
        roundNumber: 'desc',
      },
    });

    if (!lastFixture) {
      throw new BadRequestException('No fixtures found for this save');
    }

    const maxRound = lastFixture.roundNumber;

    if (currentRound > maxRound) {
      throw new BadRequestException('Season already finished');
    }

    const fixtures = await this.prisma.saveFixture.findMany({
      where: {
        gameSaveId,
        roundNumber: currentRound,
        matchResult: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    for (const fixture of fixtures) {
      const simulation = await this.simulateFixtureScore(
        gameSaveId,
        fixture.homeTeamId,
        fixture.awayTeamId,
      );

      const homeSnapshot = await this.buildMatchTeamSnapshot(
        gameSaveId,
        fixture.homeTeamId,
      );

      const awaySnapshot = await this.buildMatchTeamSnapshot(
        gameSaveId,
        fixture.awayTeamId,
      );

      const homeSubResult = this.simulateFatigueAndSubstitutions(
        homeSnapshot.lineup,
        homeSnapshot.bench,
        'home',
      );

      const awaySubResult = this.simulateFatigueAndSubstitutions(
        awaySnapshot.lineup,
        awaySnapshot.bench,
        'away',
      );

      const homeGoalEvents = await this.assignGoalsToPlayers(
        gameSaveId,
        fixture.homeTeamId,
        simulation.homeGoals,
        homeSnapshot.lineup,
        'home',
      );

      const awayGoalEvents = await this.assignGoalsToPlayers(
        gameSaveId,
        fixture.awayTeamId,
        simulation.awayGoals,
        awaySnapshot.lineup,
        'away',
      );

      const matchEvents = [
        ...homeSubResult.events,
        ...awaySubResult.events,
        ...homeGoalEvents,
        ...awayGoalEvents,
      ].sort((a, b) => a.minute - b.minute);

      await this.validateTeamHasCompleteLineup(gameSaveId, fixture.homeTeamId);
      await this.validateTeamHasCompleteLineup(gameSaveId, fixture.awayTeamId);

      await this.saveMatchResult(
        gameSaveId,
        fixture.id,
        simulation.homeGoals,
        simulation.awayGoals,
        {
          homeFormation: homeSnapshot.formation,
          awayFormation: awaySnapshot.formation,
          homeLineup: homeSnapshot.lineup,
          awayLineup: awaySnapshot.lineup,
          homeBench: homeSnapshot.bench,
          awayBench: awaySnapshot.bench,
          events: matchEvents,
        },
      );
    }

    await this.tryAdvanceRoundIfRoundFinished(gameSaveId, currentRound);

    const playedRoundFixtures = await this.prisma.saveFixture.findMany({
      where: {
        gameSaveId,
        roundNumber: currentRound,
      },
      include: {
        matchResult: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const mappedRoundFixtures = playedRoundFixtures.map((fixture) =>
      this.mapFixtureForResponse(fixture),
    );

    const summaryMyFixture = gameSave.selectedTeamId
      ? mappedRoundFixtures.find(
          (fixture) =>
            fixture.homeTeam.id === gameSave.selectedTeamId ||
            fixture.awayTeam.id === gameSave.selectedTeamId,
        ) ?? null
      : null;

    const seasonState = await this.getSeasonState(gameSaveId);
    const seasonSummary = seasonState.isSeasonFinished
      ? await this.buildSeasonSummary(gameSaveId)
      : null;

    return {
      message: 'Round played successfully',
      roundNumber: currentRound,
      matchesPlayed: fixtures.length,
      myFixture: summaryMyFixture,
      fixtures: mappedRoundFixtures,
      seasonState,
      seasonSummary,
    };
  }

  private async assignGoalsToPlayers(
    gameSaveId: string,
    saveTeamId: string,
    goals: number,
    lineupSnapshot: any[],
    teamSide: 'home' | 'away',
  ) {
    if (goals <= 0) return [];

    const candidates = lineupSnapshot
      .filter((player) =>
        ['ST', 'LW', 'RW', 'CAM', 'CM'].includes(player.position),
      )
      .sort((a, b) => {
        if (b.shooting !== a.shooting) return b.shooting - a.shooting;
        return b.overall - a.overall;
      })
      .slice(0, 6);

    if (!candidates.length) return [];

    const goalEvents: any[] = [];

    for (let i = 0; i < goals; i++) {
      const scorer =
        candidates[Math.floor(Math.random() * Math.min(candidates.length, 4))];

      await this.prisma.savePlayer.update({
        where: {
          id: scorer.id,
        },
        data: {
          goalsScored: {
            increment: 1,
          },
        },
      });

      goalEvents.push({
        minute: Math.floor(this.randomBetween(5, 90)),
        type: 'GOAL',
        teamSide,
        player: {
          id: scorer.id,
          name: scorer.name,
          position: scorer.position,
        },
      });
    }

    return goalEvents.sort((a, b) => a.minute - b.minute);
  }

  async getSaveStandings(gameSaveId: string) {
    const standings = await this.prisma.saveStanding.findMany({
      where: {
        gameSaveId,
      },
      include: {
        saveTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
      },
    });

    const sortedStandings = standings.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      const goalDifferenceA = a.goalsFor - a.goalsAgainst;
      const goalDifferenceB = b.goalsFor - b.goalsAgainst;

      if (goalDifferenceB !== goalDifferenceA) {
        return goalDifferenceB - goalDifferenceA;
      }

      if (b.goalsFor !== a.goalsFor) {
        return b.goalsFor - a.goalsFor;
      }

      return a.saveTeam.name.localeCompare(b.saveTeam.name);
    });

    return sortedStandings.map((standing, index) => ({
      position: index + 1,
      team: standing.saveTeam,
      played: standing.played,
      wins: standing.wins,
      draws: standing.draws,
      losses: standing.losses,
      goalsFor: standing.goalsFor,
      goalsAgainst: standing.goalsAgainst,
      goalDifference: standing.goalsFor - standing.goalsAgainst,
      points: standing.points,
    }));
  }

  async getGameSave(saveId: string) {
    return this.prisma.gameSave.findUnique({
      where: {
        id: saveId,
      },
    });
  }

  async getSeasonState(saveId: string) {
    const gameSave = await this.prisma.gameSave.findUnique({
      where: {
        id: saveId,
      },
    });

    if (!gameSave) {
      throw new BadRequestException('Game save not found');
    }

    const lastFixture = await this.prisma.saveFixture.findFirst({
      where: {
        gameSaveId: saveId,
      },
      orderBy: {
        roundNumber: 'desc',
      },
    });

    if (!lastFixture) {
      throw new BadRequestException('No fixtures found for this save');
    }

    const totalRounds = lastFixture.roundNumber;
    const currentRound = gameSave.currentRound;
    const isFinished = currentRound > totalRounds;

    return {
      saveId: gameSave.id,
      currentRound,
      totalRounds,
      isFinished,
      isSeasonFinished: isFinished,
    };
  }

  async getCurrentRoundFixtures(saveId: string) {
    const gameSave = await this.prisma.gameSave.findUnique({
      where: {
        id: saveId,
      },
    });

    if (!gameSave) {
      throw new BadRequestException('Game save not found');
    }

    const lastFixture = await this.prisma.saveFixture.findFirst({
      where: {
        gameSaveId: saveId,
      },
      orderBy: {
        roundNumber: 'desc',
      },
    });

    if (!lastFixture) {
      throw new BadRequestException('No fixtures found for this save');
    }

    const totalRounds = lastFixture.roundNumber;
    const currentRound = gameSave.currentRound;

    if (currentRound > totalRounds) {
      throw new BadRequestException('Season already finished');
    }

    const fixtures = await this.prisma.saveFixture.findMany({
      where: {
        gameSaveId: saveId,
        roundNumber: currentRound,
      },
      include: {
        matchResult: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return fixtures.map((fixture) => this.mapFixtureForResponse(fixture));
  }

  async getLastRoundFixtures(saveId: string) {
    const gameSave = await this.prisma.gameSave.findUnique({
      where: {
        id: saveId,
      },
    });

    if (!gameSave) {
      throw new BadRequestException('Game save not found');
    }

    const lastPlayedRound = gameSave.currentRound - 1;

    if (lastPlayedRound < 1) {
      throw new BadRequestException('No rounds have been played yet');
    }

    const fixtures = await this.prisma.saveFixture.findMany({
      where: {
        gameSaveId: saveId,
        roundNumber: lastPlayedRound,
      },
      include: {
        matchResult: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return fixtures.map((fixture) => this.mapFixtureForResponse(fixture));
  }

  async getDashboard(saveId: string) {
    const gameSave = await this.prisma.gameSave.findUnique({
      where: {
        id: saveId,
      },
      select: {
        id: true,
        name: true,
        currentRound: true,
        selectedTeamId: true,
      },
    });

    if (!gameSave) {
      throw new BadRequestException('Game save not found');
    }

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
      throw new BadRequestException('No fixtures found for this save');
    }

    const totalRounds = lastFixture.roundNumber;
    const currentRound = gameSave.currentRound;
    const isFinished = currentRound > totalRounds;

    let currentRoundFixtures: Awaited<
      ReturnType<UsersService['getCurrentRoundFixtures']>
    > = [];

    let lastRoundFixtures: Awaited<
      ReturnType<UsersService['getLastRoundFixtures']>
    > = [];

    if (!isFinished) {
      currentRoundFixtures = await this.getCurrentRoundFixtures(saveId);
    }

    if (currentRound > 1) {
      lastRoundFixtures = await this.getLastRoundFixtures(saveId);
    }

    const standings = await this.getSaveStandings(saveId);
  
    let selectedTeam: {
      id: string;
      name: string;
      shortName: string;
      formation?: string;
    } | null = null;

    if (gameSave.selectedTeamId) {
      selectedTeam = await this.prisma.saveTeam.findUnique({
        where: {
          id: gameSave.selectedTeamId,
        },
        select: {
          id: true,
          name: true,
          shortName: true,
        },
      });
    }

    const topScorer = await this.prisma.savePlayer.findFirst({
      where: {
        gameSaveId: saveId,
        goalsScored: {
          gt: 0,
        },
      },
      orderBy: [
        { goalsScored: 'desc' },
        { overall: 'desc' },
        { shooting: 'desc' },
      ],
      select: {
        id: true,
        name: true,
        position: true,
        overall: true,
        shooting: true,
        goalsScored: true,
        saveTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
      },
    });

    return {
      save: {
        id: gameSave.id,
        name: gameSave.name,
      },
      selectedTeam,
      seasonState: {
        currentRound,
        totalRounds,
        isFinished,
        isSeasonFinished: isFinished,
      },
      currentRoundFixtures,
      lastRoundFixtures,
      standings,
      topScorer,
    };
  }

  async getSquadScreen(saveId: string) {
    const [clubSnapshot, lineup, teamOverall] = await Promise.all([
      this.getSelectedTeamClubSnapshot(saveId),
      this.getSelectedTeamLineup(saveId),
      this.getSelectedTeamOverall(saveId),
    ]);

    return {
      screen: 'SQUAD',
      team: clubSnapshot.team,
      squad: clubSnapshot.summary.squad,
      lineup: {
        ...clubSnapshot.summary.lineup,
        preview: lineup.lineup.slots,
        bench: lineup.bench,
        reserve: lineup.reserve,
      },
      overall: clubSnapshot.summary.overall,
      detailedOverall: teamOverall,
    };
  }

  async getTransferScreen(saveId: string) {
    const [market, clubSnapshot, myListedPlayers, transferHistory] =
      await Promise.all([
        this.getMarketPlayers(saveId),
        this.getSelectedTeamClubSnapshot(saveId),
        this.getSelectedTeamTransferListedPlayers(saveId),
        this.getTransferHistory(saveId),
      ]);

    return {
      screen: 'TRANSFER',
      team: clubSnapshot.team,
      squad: clubSnapshot.summary.squad,
      market: {
        totalPlayers: market.totalPlayers,
        players: market.players,
      },
      myTransferListedPlayers: myListedPlayers,
      recentTransferHistory: transferHistory.items.slice(0, 10),
      transferSummary: {
        listed: clubSnapshot.summary.squad.transferListedCount,
        squadSize: clubSnapshot.summary.squad.squadSize,
      },
    };
  }

  async getFixturesScreen(saveId: string) {
    const seasonState = await this.getSeasonState(saveId);

    if (seasonState.isSeasonFinished || seasonState.isFinished) {
      const standings = await this.getSaveStandings(saveId);
      const roundsOverview = await this.getRoundsOverview(saveId);
      const lastRoundFixtures = await this.getLastRoundFixtures(saveId);
      const seasonSummary = await this.buildSeasonSummary(saveId);

      return {
        seasonState,
        seasonSummary,
        round: {
          roundNumber: seasonState.totalRounds,
          remainingFixtures: 0,
          isSeasonFinished: true,
        },
        myMatch: null,
        standings,
        otherMatches: {
          played: lastRoundFixtures,
          remaining: [],
        },
        roundsOverview,
      };
    }

    const [
      actionSummary,
      myMatch,
      otherResults,
      roundsOverview,
      standings,
    ] = await Promise.all([
      this.getCurrentRoundActionSummary(saveId),
      this.getCurrentRoundMyMatchResult(saveId),
      this.getCurrentRoundOtherResults(saveId),
      this.getRoundsOverview(saveId),
      this.getSaveStandings(saveId),
    ]);

    return {
      screen: 'FIXTURES',
      season: seasonState,
      round: actionSummary.round,
      myMatch,
      otherMatches: otherResults,
      actions: actionSummary.actions,
      roundsOverview,
      standings,
    };
  }

  async getStandingsScreen(saveId: string) {
    const [table, summary] = await Promise.all([
      this.getSaveStandings(saveId),
      this.getSeasonSummary(saveId),
    ]);

    return {
      screen: 'STANDINGS',
      season: summary.season,
      selectedTeam: summary.selectedTeam,
      selectedTeamStanding: summary.selectedTeamStanding,
      champion: summary.champion,
      table,
      highlights: summary.highlights,
    };
  }
  
  async getSelectedTeam(saveId: string) {
    const { selectedTeam } = await this.getRequiredSelectedTeam(saveId);

    return {
      id: selectedTeam.id,
      name: selectedTeam.name,
      shortName: selectedTeam.shortName,
      formation: selectedTeam.formation,
      tacticStyle: selectedTeam.tacticStyle,
      budget: selectedTeam.budget,
    };
  }

  async updateSelectedTeamTacticStyle(saveId: string, tacticStyle: string) {
    const allowedTactics = ['balanced', 'attacking', 'defensive'];

    if (!allowedTactics.includes(tacticStyle)) {
      throw new BadRequestException(
        'Invalid tacticStyle. Allowed values: balanced, attacking, defensive',
      );
    }

    const { selectedTeam } = await this.getRequiredSelectedTeam(saveId);

    const updatedTeam = await this.prisma.saveTeam.update({
      where: {
        id: selectedTeam.id,
      },
      data: {
        tacticStyle,
      },
      select: {
        id: true,
        name: true,
        shortName: true,
        formation: true,
        tacticStyle: true,
        budget: true,
      },
    });

    return {
      message: 'Tactic style updated successfully',
      team: updatedTeam,
    };
  }

  async getSelectedTeamPlayers(saveId: string) {
    const { selectedTeam } = await this.getRequiredSelectedTeam(saveId);

    const players = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId: saveId,
        saveTeamId: selectedTeam.id,
      },
      select: {
        id: true,
        name: true,
        age: true,
        position: true,
        overall: true,
        pace: true,
        shooting: true,
        passing: true,
        dribbling: true,
        defending: true,
        physical: true,
        role: true,
        lineupPosition: true,
        lineupSlot: true,
        isTransferListed: true,
        marketValue: true,
      },
    });

    const positionOrder: Record<string, number> = {
      GK: 1,
      LB: 2,
      CB: 3,
      RB: 4,
      CDM: 5,
      CM: 6,
      CAM: 7,
      LW: 8,
      RW: 9,
      ST: 10,
    };

    const sortedPlayers = players.sort((a, b) => {
      const posA = positionOrder[a.position] ?? 999;
      const posB = positionOrder[b.position] ?? 999;

      if (posA !== posB) {
        return posA - posB;
      }

      return a.name.localeCompare(b.name);
    });

    return {
      team: {
        id: selectedTeam.id,
        name: selectedTeam.name,
        shortName: selectedTeam.shortName,
      },
      players: sortedPlayers,
    };
  }

  private async buildSeasonSummary(gameSaveId: string) {
    const standings = await this.prisma.saveStanding.findMany({
      where: {
        gameSaveId,
      },
      include: {
        saveTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
      },
    });

    const finalStandings = standings
      .sort((a, b) => {
        const goalDifferenceA = a.goalsFor - a.goalsAgainst;
        const goalDifferenceB = b.goalsFor - b.goalsAgainst;

        if (b.points !== a.points) return b.points - a.points;
        if (goalDifferenceB !== goalDifferenceA) {
          return goalDifferenceB - goalDifferenceA;
        }
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

        return a.saveTeam.shortName.localeCompare(b.saveTeam.shortName);
      })
      .map((row, index) => ({
        position: index + 1,
        team: {
          id: row.saveTeam.id,
          name: row.saveTeam.name,
          shortName: row.saveTeam.shortName,
        },
        played: row.played,
        wins: row.wins,
        draws: row.draws,
        losses: row.losses,
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
        goalDifference: row.goalsFor - row.goalsAgainst,
        points: row.points,
      }));

    return {
      winner: finalStandings[0] ?? null,
      finalStandings,
    };
  }

  private async runBotAiBeforeRound(saveId: string) {
    const gameSave = await this.prisma.gameSave.findUnique({
      where: {
        id: saveId,
      },
      select: {
        selectedTeamId: true,
      },
    });

    if (!gameSave?.selectedTeamId) {
      return;
    }

    const botTeams = await this.prisma.saveTeam.findMany({
      where: {
        gameSaveId: saveId,
        id: {
          not: gameSave.selectedTeamId,
        },
      },
      select: {
        id: true,
        formation: true,
        budget: true,
      },
    });

    for (const botTeam of botTeams) {
      await this.autoPickTeamLineup(saveId, botTeam.id);

      if (Math.random() < 0.25) {
        await this.botListRandomPlayer(saveId, botTeam.id);
      }

      if (Math.random() < 0.15) {
        await this.botBuyRandomPlayer(saveId, botTeam.id);
      }
    }
  }

  private async autoPickTeamLineup(saveId: string, saveTeamId: string) {
    const team = await this.prisma.saveTeam.findFirst({
      where: {
        id: saveTeamId,
        gameSaveId: saveId,
      },
      select: {
        id: true,
        formation: true,
      },
    });

    if (!team) {
      return;
    }

    const formation = isSupportedFormation(team.formation)
      ? (team.formation as SupportedFormation)
      : '4-3-3';

    const players = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId: saveId,
        saveTeamId: team.id,
      },
      select: {
        id: true,
        name: true,
        age: true,
        position: true,
        overall: true,
        pace: true,
        shooting: true,
        passing: true,
        dribbling: true,
        defending: true,
        physical: true,
        role: true,
        lineupPosition: true,
        lineupSlot: true,
        isTransferListed: true,
        marketValue: true,
        saveTeamId: true,
        gameSaveId: true,
      },
      orderBy: [
        { overall: 'desc' },
        { name: 'asc' },
      ],
    });

    if (players.length < 11) {
      return;
    }

    const assignments = this.buildBestLineupAssignments(players, formation);
    const starterIds = new Set(assignments.map((item) => item.playerId));

    const benchPlayerIds = players
      .filter((player) => !starterIds.has(player.id))
      .sort((a, b) => b.overall - a.overall)
      .slice(0, 7)
      .map((player) => player.id);

    await this.applySelectedTeamLineupState(
      saveId,
      team.id,
      formation,
      assignments.map((item) => ({
        playerId: item.playerId,
        lineupSlot: item.lineupSlot,
      })),
      benchPlayerIds,
    );

    const debugPlayers = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId: saveId,
        saveTeamId,
      },
      select: {
        name: true,
        role: true,
        position: true,
        lineupPosition: true,
        lineupSlot: true,
      },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });

    console.table(debugPlayers);

    const starterCount = await this.prisma.savePlayer.count({
      where: {
        gameSaveId: saveId,
        saveTeamId,
        role: 'starter',
        lineupSlot: {
          not: null,
        },
        lineupPosition: {
          not: null,
        },
      },
    });

    if (starterCount !== 11) {
      throw new BadRequestException(
        `Auto pick failed: expected 11 starters, got ${starterCount}`,
      );
    }
  }

  private async botListRandomPlayer(saveId: string, saveTeamId: string) {
    const candidates = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId: saveId,
        saveTeamId,
        isTransferListed: false,
        role: {
          in: ['bench', 'reserve'],
        },
      },
      orderBy: {
        overall: 'asc',
      },
      take: 5,
    });

    if (candidates.length === 0) {
      return;
    }

    const player = candidates[Math.floor(Math.random() * candidates.length)];

    await this.prisma.savePlayer.update({
      where: {
        id: player.id,
      },
      data: {
        isTransferListed: true,
      },
    });

    await this.createTransferHistoryEntry({
      gameSaveId: saveId,
      playerId: player.id,
      fromSaveTeamId: saveTeamId,
      toSaveTeamId: null,
      type: 'LISTED',
      marketValue: player.marketValue,
    });
  }

  private async botBuyRandomPlayer(saveId: string, buyerTeamId: string) {
    const buyer = await this.prisma.saveTeam.findFirst({
      where: {
        id: buyerTeamId,
        gameSaveId: saveId,
      },
      select: {
        id: true,
        budget: true,
      },
    });

    if (!buyer) {
      return;
    }

    const affordablePlayers = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId: saveId,
        isTransferListed: true,
        saveTeamId: {
          not: buyerTeamId,
        },
        marketValue: {
          lte: buyer.budget,
        },
      },
      orderBy: [
        { overall: 'desc' },
        { marketValue: 'asc' },
      ],
      take: 5,
    });

    if (affordablePlayers.length === 0) {
      return;
    }

    const player =
      affordablePlayers[Math.floor(Math.random() * affordablePlayers.length)];

    await this.prisma.$transaction(async (tx) => {
      await tx.saveTeam.update({
        where: {
          id: buyerTeamId,
        },
        data: {
          budget: {
            decrement: player.marketValue,
          },
        },
      });

      await tx.saveTeam.update({
        where: {
          id: player.saveTeamId,
        },
        data: {
          budget: {
            increment: player.marketValue,
          },
        },
      });

      await tx.savePlayer.update({
        where: {
          id: player.id,
        },
        data: {
          saveTeamId: buyerTeamId,
          isTransferListed: false,
          role: 'bench',
          lineupPosition: null,
          lineupSlot: null,
        },
      });

      await tx.transferHistory.create({
        data: {
          gameSaveId: saveId,
          playerId: player.id,
          fromSaveTeamId: player.saveTeamId,
          toSaveTeamId: buyerTeamId,
          type: 'BOUGHT',
          marketValue: player.marketValue,
        },
      });
    });
  }

  private async getRequiredSelectedTeam(saveId: string) {
    const gameSave = await this.prisma.gameSave.findUnique({
      where: {
        id: saveId,
      },
      select: {
        id: true,
        name: true,
        currentRound: true,
        selectedTeamId: true,
      },
    });

    if (!gameSave) {
      throw new BadRequestException('Game save not found');
    }

    if (!gameSave.selectedTeamId) {
      throw new BadRequestException('No selected team for this save');
    }

    const selectedTeam = await this.prisma.saveTeam.findUnique({
      where: {
        id: gameSave.selectedTeamId,
      },
      select: {
        id: true,
        name: true,
        shortName: true,
        formation: true,
        tacticStyle: true,
        budget: true,
        gameSaveId: true,
        saveLeagueId: true,
      },
    });

    if (!selectedTeam) {
      throw new BadRequestException('Selected team not found');
    }

    return {
      gameSave,
      selectedTeam,
    };
  }

  async getSelectedTeamStanding(saveId: string) {
    const { selectedTeam } = await this.getRequiredSelectedTeam(saveId);
    const standings = await this.getSaveStandings(saveId);

    const standing = standings.find((item) => item.team.id === selectedTeam.id);

    if (!standing) {
      throw new BadRequestException('Selected team standing not found');
    }

    return standing;
  }

  async getSelectedTeamUpcomingFixtures(saveId: string) {
    const { gameSave, selectedTeam } = await this.getRequiredSelectedTeam(saveId);

    const fixtures = await this.prisma.saveFixture.findMany({
      where: {
        gameSaveId: saveId,
        roundNumber: {
          gte: gameSave.currentRound,
        },
        OR: [
          { homeTeamId: selectedTeam.id },
          { awayTeamId: selectedTeam.id },
        ],
      },
      include: {
        matchResult: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
      },
      orderBy: [
        {
          roundNumber: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],
    });

    return fixtures.map((fixture) => this.mapFixtureForResponse(fixture));
  }

  async getSelectedTeamLastFixtures(saveId: string) {
    const { gameSave, selectedTeam } = await this.getRequiredSelectedTeam(saveId);

    const fixtures = await this.prisma.saveFixture.findMany({
      where: {
        gameSaveId: saveId,
        roundNumber: {
          lt: gameSave.currentRound,
        },
        OR: [
          { homeTeamId: selectedTeam.id },
          { awayTeamId: selectedTeam.id },
        ],
      },
      include: {
        matchResult: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
      },
      orderBy: [
        {
          roundNumber: 'desc',
        },
        {
          createdAt: 'asc',
        },
      ],
    });

    return fixtures.map((fixture) => this.mapFixtureForResponse(fixture));
  }

  private async tryAdvanceRoundIfRoundFinished(saveId: string, roundNumber: number) {
    const fixturesInRound = await this.prisma.saveFixture.findMany({
      where: {
        gameSaveId: saveId,
        roundNumber,
      },
      include: {
        matchResult: true,
      },
    });

    const unplayedFixturesInRound = fixturesInRound.filter(
      (fixture) => fixture.matchResult === null,
    );

    if (unplayedFixturesInRound.length === 0) {
      await this.prisma.gameSave.update({
        where: {
          id: saveId,
        },
        data: {
          currentRound: {
            increment: 1,
          },
        },
      });
    }
  }

  async getSelectedTeamNextFixture(saveId: string) {
    const { gameSave, selectedTeam } = await this.getRequiredSelectedTeam(saveId);

    const fixture = await this.prisma.saveFixture.findFirst({
      where: {
        gameSaveId: saveId,
        roundNumber: gameSave.currentRound,
        OR: [
          { homeTeamId: selectedTeam.id },
          { awayTeamId: selectedTeam.id },
        ],
      },
      include: {
        matchResult: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (!fixture) {
      throw new BadRequestException('No next fixture found for selected team');
    }

   return this.mapFixtureForResponse(fixture);
  }

  async playSelectedTeamNextMatch(
    saveId: string,
    homeGoals: number,
    awayGoals: number,
  ) {
    const { gameSave, myFixture } = await this.getCurrentRoundContext(saveId);

    if (myFixture.matchResult) {
      throw new BadRequestException('Selected team match in current round is already played');
    }

    await this.saveMatchResult(saveId, myFixture.id, homeGoals, awayGoals);
    await this.tryAdvanceRoundIfRoundFinished(saveId, gameSave.currentRound);

    const updatedFixture = await this.prisma.saveFixture.findUnique({
      where: {
        id: myFixture.id,
      },
      include: {
        matchResult: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
      },
    });

    if (!updatedFixture) {
      throw new BadRequestException('Updated fixture not found');
    }

    const updatedGameSave = await this.prisma.gameSave.findUnique({
      where: {
        id: saveId,
      },
      select: {
        currentRound: true,
      },
    });

    return {
      message: 'Selected team current round match played successfully',
      fixture: this.mapFixtureForResponse(updatedFixture),
      seasonState: {
        currentRound: updatedGameSave?.currentRound ?? gameSave.currentRound,
      },
    };
  }
  
  async simulateRemainingFixturesInCurrentRound(saveId: string) {
    const { gameSave, myFixture, remainingFixtures } =
      await this.getCurrentRoundContext(saveId);

    if (!myFixture.matchResult) {
      throw new BadRequestException(
        'You must play your selected team match before simulating the rest of the round',
      );
    }

    const fixturesToSimulate = remainingFixtures.filter(
      (fixture) => fixture.id !== myFixture.id,
    );

    if (fixturesToSimulate.length === 0) {
      throw new BadRequestException('Current round is already fully simulated');
    }

    const playedFixtures: Array<{
      id: string;
      roundNumber: number;
      createdAt: Date;
      homeTeam: {
        id: string;
        name: string;
        shortName: string;
        formation?: string;
      };
      awayTeam: {
        id: string;
        name: string;
        shortName: string;
        formation?: string;
      };
      isPlayed: boolean;
      homeGoals: number | null;
      awayGoals: number | null;
      playedAt: Date | null;
    }> = [];

    for (const fixture of fixturesToSimulate) {
      const simulation = await this.simulateFixtureScore(
        saveId,
        fixture.homeTeamId,
        fixture.awayTeamId,
      );

      await this.saveMatchResult(
        saveId,
        fixture.id,
        simulation.homeGoals,
        simulation.awayGoals,
      );

      const updatedFixture = await this.prisma.saveFixture.findUnique({
        where: {
          id: fixture.id,
        },
        include: {
          matchResult: {
            include: {
              events: {
                orderBy: {
                  minute: 'asc',
                },
              },
            },
          },
          homeTeam: {
            select: {
              id: true,
              name: true,
              shortName: true,
            },
          },
          awayTeam: {
            select: {
              id: true,
              name: true,
              shortName: true,
            },
          },
        },
      });

      if (!updatedFixture || !updatedFixture.matchResult) {
        throw new BadRequestException('Played fixture could not be loaded');
      }

      if (updatedFixture) {
        playedFixtures.push(this.mapFixtureForResponse(updatedFixture));
      }
    }

    await this.tryAdvanceRoundIfRoundFinished(saveId, gameSave.currentRound);

    const updatedGameSave = await this.prisma.gameSave.findUnique({
      where: {
        id: saveId,
      },
      select: {
        currentRound: true,
      },
    });

    return {
      message: 'Remaining fixtures in current round simulated successfully',
      simulatedCount: playedFixtures.length,
      fixtures: playedFixtures,
      seasonState: {
        currentRound: updatedGameSave?.currentRound ?? gameSave.currentRound,
      },
    };
  }

  async getCurrentRoundStatus(saveId: string) {
    const { gameSave, selectedTeam } = await this.getRequiredSelectedTeam(saveId);

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
      throw new BadRequestException('No fixtures found for this save');
    }

    const totalRounds = lastFixture.roundNumber;

    if (gameSave.currentRound > totalRounds) {
      return {
        currentRound: gameSave.currentRound,
        totalRounds,
        isSeasonFinished: true,
        isRoundFinished: true,
        myNextFixture: null,
        myFixturePlayed: true,
        hasPlayedMyMatchInCurrentRound: true,
        remainingFixturesCount: 0,
        remainingOtherFixturesCount: 0,
        canPlayMyNextMatch: false,
        canSimulateRemainingFixtures: false,
        canCompleteCurrentRound: false,
      };
    }

    const currentRoundFixtures = await this.getCurrentRoundFixturesWithTeams(
      saveId,
      gameSave.currentRound,
    );

    const myFixture = currentRoundFixtures.find(
      (fixture) =>
        fixture.homeTeamId === selectedTeam.id ||
        fixture.awayTeamId === selectedTeam.id,
    );

    if (!myFixture) {
      throw new BadRequestException('Selected team has no fixture in current round');
    }

    const remainingFixtures = currentRoundFixtures.filter(
      (fixture) => fixture.matchResult === null,
    );

    const myFixturePlayed = myFixture.matchResult !== null;

    const remainingOtherFixturesCount = remainingFixtures.filter(
      (fixture) => fixture.id !== myFixture.id,
    ).length;

    const isRoundFinished = remainingFixtures.length === 0;

    return {
      currentRound: gameSave.currentRound,
      totalRounds,
      isSeasonFinished: false,
      isRoundFinished,
      myNextFixture: this.mapFixtureForResponse(myFixture),
      myFixturePlayed,
      hasPlayedMyMatchInCurrentRound: myFixturePlayed,
      remainingFixturesCount: remainingFixtures.length,
      remainingOtherFixturesCount,
      canPlayMyNextMatch: !myFixturePlayed,
      canSimulateRemainingFixtures: myFixturePlayed && remainingOtherFixturesCount > 0,
      canCompleteCurrentRound: !isRoundFinished,
      recommendedNextAction: !myFixturePlayed
        ? 'PLAY_MY_MATCH'
        : remainingOtherFixturesCount > 0
          ? 'SIMULATE_REST'
          : 'ROUND_FINISHED',
    };
  }

  async getSaveResumeSummary(userId: string, saveId: string) {
    const save = await this.getRequiredOwnedGameSave(userId, saveId);

    const [
      totalRounds,
      currentRoundStatus,
      standings,
      selectedTeam,
      nextFixture,
      currentRoundFixtures,
      lastRoundFixtures,
    ] = await Promise.all([
      this.getGameSaveTotalRounds(saveId),
      this.getCurrentRoundStatus(saveId).catch(() => null),
      this.getSaveStandings(saveId),
      save.selectedTeamId
        ? this.prisma.saveTeam.findUnique({
            where: {
              id: save.selectedTeamId,
            },
            select: {
              id: true,
              name: true,
              shortName: true,
              formation: true,
            },
          })
        : Promise.resolve(null),
      this.getSelectedTeamNextFixture(saveId).catch(() => null),
      this.getCurrentRoundFixtures(saveId).catch(() => []),
      this.getLastRoundFixtures(saveId).catch(() => []),
    ]);

    const selectedTeamStanding = selectedTeam
      ? standings.find((item) => item.team.id === selectedTeam.id) ?? null
      : null;

    return {
      save: {
        id: save.id,
        name: save.name,
        createdAt: save.createdAt,
        updatedAt: save.updatedAt,
        currentRound: save.currentRound,
        totalRounds,
      },
      selectedTeam,
      selectedTeamStanding,
      seasonState: {
        currentRound: save.currentRound,
        totalRounds,
        isFinished: totalRounds > 0 && save.currentRound > totalRounds,
      },
      currentRoundStatus,
      nextFixture,
      currentRoundFixtures,
      lastRoundFixtures,
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

  private async getCurrentRoundFixturesWithTeams(saveId: string, roundNumber: number) {
    return this.prisma.saveFixture.findMany({
      where: {
        gameSaveId: saveId,
        roundNumber,
      },
      include: {
        matchResult: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  private async getCurrentRoundContext(saveId: string) {
    const { gameSave, selectedTeam } = await this.getRequiredSelectedTeam(saveId);

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
      throw new BadRequestException('No fixtures found for this save');
    }

    const totalRounds = lastFixture.roundNumber;

    if (gameSave.currentRound > totalRounds) {
      throw new BadRequestException('Season already finished');
    }

    const fixtures = await this.getCurrentRoundFixturesWithTeams(
      saveId,
      gameSave.currentRound,
    );

    const myFixture = fixtures.find(
      (fixture) =>
        fixture.homeTeamId === selectedTeam.id ||
        fixture.awayTeamId === selectedTeam.id,
    );

    if (!myFixture) {
      throw new BadRequestException('Selected team has no fixture in current round');
    }

    const remainingFixtures = fixtures.filter((fixture) => fixture.matchResult === null);

    return {
      gameSave,
      selectedTeam,
      totalRounds,
      fixtures,
      myFixture,
      remainingFixtures,
    };
  }

  async completeCurrentRound(saveId: string) {
    const { gameSave, myFixture } = await this.getCurrentRoundContext(saveId);

    const playedFixtures: Array<{
      id: string;
      roundNumber: number;
      createdAt: Date;
      homeTeam: {
        id: string;
        name: string;
        shortName: string;
        formation?: string;
      };
      awayTeam: {
        id: string;
        name: string;
        shortName: string;
        formation?: string;
      };
      isPlayed: boolean;
      homeGoals: number | null;
      awayGoals: number | null;
      playedAt: Date | null;
    }> = [];

    if (!myFixture.matchResult) {
      const simulation = await this.simulateFixtureScore(
        saveId,
        myFixture.homeTeamId,
        myFixture.awayTeamId,
      );

      await this.saveMatchResult(
        saveId,
        myFixture.id,
        simulation.homeGoals,
        simulation.awayGoals,
      );

      const updatedMyFixture = await this.prisma.saveFixture.findUnique({
        where: {
          id: myFixture.id,
        },
        include: {
          matchResult: true,
          homeTeam: {
            select: {
              id: true,
              name: true,
              shortName: true,
              formation: true,
            },
          },
          awayTeam: {
            select: {
              id: true,
              name: true,
              shortName: true,
              formation: true,
            },
          },
        },
      });

      if (updatedMyFixture) {
        playedFixtures.push(this.mapFixtureForResponse(updatedMyFixture));
      }
    }

    const fixturesStillRemaining = await this.prisma.saveFixture.findMany({
      where: {
        gameSaveId: saveId,
        roundNumber: gameSave.currentRound,
        matchResult: null,
        id: {
          not: myFixture.id,
        },
      },
      include: {
        matchResult: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    for (const fixture of fixturesStillRemaining) {
      const simulation = await this.simulateFixtureScore(
        saveId,
        fixture.homeTeamId,
        fixture.awayTeamId,
      );

      await this.saveMatchResult(
        saveId,
        fixture.id,
        simulation.homeGoals,
        simulation.awayGoals,
      );

      const updatedFixture = await this.prisma.saveFixture.findUnique({
        where: {
          id: fixture.id,
        },
        include: {
          matchResult: {
            include: {
              events: {
                orderBy: {
                  minute: 'asc',
                },
              },
            },
          },
          homeTeam: {
            select: {
              id: true,
              name: true,
              shortName: true,
            },
          },
          awayTeam: {
            select: {
              id: true,
              name: true,
              shortName: true,
            },
          },
        },
      });

      if (!updatedFixture || !updatedFixture.matchResult) {
        throw new BadRequestException('Played fixture could not be loaded');
      }

      if (updatedFixture) {
        playedFixtures.push(this.mapFixtureForResponse(updatedFixture));
      }
    }

    if (playedFixtures.length === 0) {
      throw new BadRequestException('Current round is already completed');
    }

    await this.tryAdvanceRoundIfRoundFinished(saveId, gameSave.currentRound);

    const updatedGameSave = await this.prisma.gameSave.findUnique({
      where: {
        id: saveId,
      },
      select: {
        currentRound: true,
      },
    });

    return {
      message: 'Current round completed successfully',
      simulatedCount: playedFixtures.length,
      fixtures: playedFixtures,
      seasonState: {
        currentRound: updatedGameSave?.currentRound ?? gameSave.currentRound,
      },
    };
  }

  async getRoundsOverview(saveId: string) {
    const gameSave = await this.prisma.gameSave.findUnique({
      where: { id: saveId },
      select: {
        id: true,
        currentRound: true,
        selectedTeamId: true,
      },
    });

    if (!gameSave) {
      throw new BadRequestException('Game save not found');
    }

    const fixtures = await this.prisma.saveFixture.findMany({
      where: {
        gameSaveId: saveId,
      },
      include: {
        matchResult: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
      },
      orderBy: [
        { roundNumber: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    if (fixtures.length === 0) {
      throw new BadRequestException('No fixtures found for this save');
    }

    const roundsMap = new Map<
      number,
      {
        roundNumber: number;
        totalFixtures: number;
        playedFixtures: number;
        isCompleted: boolean;
        isCurrent: boolean;
        selectedTeamFixture: any;
      }
    >();

    for (const fixture of fixtures) {
      const existing =
        roundsMap.get(fixture.roundNumber) ??
        {
          roundNumber: fixture.roundNumber,
          totalFixtures: 0,
          playedFixtures: 0,
          isCompleted: false,
          isCurrent: fixture.roundNumber === gameSave.currentRound,
          selectedTeamFixture: null,
        };

      existing.totalFixtures += 1;

      if (fixture.matchResult) {
        existing.playedFixtures += 1;
      }

      if (
        gameSave.selectedTeamId &&
        (fixture.homeTeam.id === gameSave.selectedTeamId ||
          fixture.awayTeam.id === gameSave.selectedTeamId)
      ) {
        existing.selectedTeamFixture = this.mapFixtureForResponse(fixture);
      }

      roundsMap.set(fixture.roundNumber, existing);
    }

    const rounds = Array.from(roundsMap.values()).map((round) => ({
      ...round,
      isCompleted: round.playedFixtures === round.totalFixtures,
      isCurrent: round.roundNumber === gameSave.currentRound,
    }));

    return {
      currentRound: gameSave.currentRound,
      rounds,
    };
  }

  async getRoundFixtures(saveId: string, roundNumber: number) {
    if (roundNumber < 1) {
      throw new BadRequestException('Round number must be at least 1');
    }

    const gameSave = await this.prisma.gameSave.findUnique({
      where: {
        id: saveId,
      },
      select: {
        id: true,
        currentRound: true,
      },
    });

    if (!gameSave) {
      throw new BadRequestException('Game save not found');
    }

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
      throw new BadRequestException('No fixtures found for this save');
    }

    if (roundNumber > lastFixture.roundNumber) {
      throw new BadRequestException('Round number exceeds total rounds');
    }

    const fixtures = await this.prisma.saveFixture.findMany({
      where: {
        gameSaveId: saveId,
        roundNumber,
      },
      include: {
        matchResult: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const mappedFixtures = fixtures.map((fixture) =>
      this.mapFixtureForResponse(fixture),
    );

    const playedFixtures = mappedFixtures.filter((fixture) => fixture.isPlayed).length;
    const totalFixtures = mappedFixtures.length;

    return {
      roundNumber,
      totalRounds: lastFixture.roundNumber,
      isCurrent: roundNumber === gameSave.currentRound,
      isCompleted: playedFixtures === totalFixtures,
      playedFixtures,
      totalFixtures,
      fixtures: mappedFixtures,
    };
  }

  private async getRequiredSaveTeam(saveId: string, teamId: string) {
    const gameSave = await this.prisma.gameSave.findUnique({
      where: {
        id: saveId,
      },
      select: {
        id: true,
        currentRound: true,
      },
    });

    if (!gameSave) {
      throw new BadRequestException('Game save not found');
    }

    const team = await this.prisma.saveTeam.findFirst({
      where: {
        id: teamId,
        gameSaveId: saveId,
      },
      select: {
        id: true,
        name: true,
        shortName: true,
        gameSaveId: true,
        saveLeagueId: true,
      },
    });

    if (!team) {
      throw new BadRequestException('Team not found in this save');
    }

    return {
      gameSave,
      team,
    };
  }
  
  async getTeamDetail(saveId: string, teamId: string) {
    const { gameSave, team } = await this.getRequiredSaveTeam(saveId, teamId);

    const standing = await this.getSaveStandings(saveId);
    const teamStanding = standing.find((item) => item.team.id === team.id);

    const players = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId: saveId,
        saveTeamId: team.id,
      },
      select: {
        id: true,
        name: true,
        age: true,
        position: true,

        overall: true,
        pace: true,
        shooting: true,
        passing: true,
        dribbling: true,
        defending: true,
        physical: true,

        role: true,
        lineupPosition: true,
        lineupSlot: true,
        marketValue: true,
        isTransferListed: true,

      },
    });

    const positionOrder: Record<string, number> = {
      GK: 1,
      LB: 2,
      CB: 3,
      RB: 4,
      CDM: 5,
      CM: 6,
      CAM: 7,
      LW: 8,
      RW: 9,
      ST: 10,
    };

    const sortedPlayers = players.sort((a, b) => {
      const posA = positionOrder[a.position] ?? 999;
      const posB = positionOrder[b.position] ?? 999;

      if (posA !== posB) {
        return posA - posB;
      }

      return a.name.localeCompare(b.name);
    });

    const allFixtures = await this.prisma.saveFixture.findMany({
      where: {
        gameSaveId: saveId,
        OR: [
          { homeTeamId: team.id },
          { awayTeamId: team.id },
        ],
      },
      include: {
        matchResult: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
      },
      orderBy: [
        {
          roundNumber: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],
    });

    const upcomingFixtures = allFixtures
      .filter((fixture) => fixture.roundNumber >= gameSave.currentRound)
      .map((fixture) => this.mapFixtureForResponse(fixture));

    const playedFixtures = allFixtures
      .filter((fixture) => fixture.matchResult !== null)
      .map((fixture) => this.mapFixtureForResponse(fixture));

    const lastFixtures = playedFixtures
      .sort((a, b) => {
        if (b.roundNumber !== a.roundNumber) {
          return b.roundNumber - a.roundNumber;
        }

        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    return {
      team,
      standing: teamStanding ?? null,
      squadSize: sortedPlayers.length,
      players: sortedPlayers,
      upcomingFixtures,
      lastFixtures,
    };
  }

  async getTeamPlayers(saveId: string, teamId: string) {
    const { team } = await this.getRequiredSaveTeam(saveId, teamId);

    const players = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId: saveId,
        saveTeamId: team.id,
      },
      select: {
      id: true,
      name: true,
      age: true,
      position: true,

      overall: true,
      pace: true,
      shooting: true,
      passing: true,
      dribbling: true,
      defending: true,
      physical: true,

      role: true,
      lineupPosition: true,
      lineupSlot: true,
      marketValue: true,
      isTransferListed: true,
    },
    });

    const positionOrder: Record<string, number> = {
      GK: 1,
      LB: 2,
      CB: 3,
      RB: 4,
      CDM: 5,
      CM: 6,
      CAM: 7,
      LW: 8,
      RW: 9,
      ST: 10,
    };

    const sortedPlayers = players.sort((a, b) => {
      const posA = positionOrder[a.position] ?? 999;
      const posB = positionOrder[b.position] ?? 999;

      if (posA !== posB) {
        return posA - posB;
      }

      return a.name.localeCompare(b.name);
    });

    return {
      team,
      players: sortedPlayers,
    };
  }

  async getTeamFixtures(saveId: string, teamId: string) {
    const { gameSave, team } = await this.getRequiredSaveTeam(saveId, teamId);

    const fixtures = await this.prisma.saveFixture.findMany({
      where: {
        gameSaveId: saveId,
        OR: [
          { homeTeamId: team.id },
          { awayTeamId: team.id },
        ],
      },
      include: {
        matchResult: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
      },
      orderBy: [
        {
          roundNumber: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],
    });

    const mappedFixtures = fixtures.map((fixture) =>
      this.mapFixtureForResponse(fixture),
    );

    return {
      team,
      currentRound: gameSave.currentRound,
      fixtures: mappedFixtures,
    };
  }

  private async getRequiredSaveLeague(saveId: string, leagueId: string) {
    const gameSave = await this.prisma.gameSave.findUnique({
      where: {
        id: saveId,
      },
      select: {
        id: true,
        currentRound: true,
        selectedTeamId: true,
      },
    });

    if (!gameSave) {
      throw new BadRequestException('Game save not found');
    }

    const league = await this.prisma.saveLeague.findFirst({
      where: {
        id: leagueId,
        gameSaveId: saveId,
      },
      select: {
        id: true,
        name: true,
        country: true,
        season: true,
        gameSaveId: true,
      },
    });

    if (!league) {
      throw new BadRequestException('League not found in this save');
    }

    return {
      gameSave,
      league,
    };
  }

  async getSaveLeagues(saveId: string) {
    const gameSave = await this.prisma.gameSave.findUnique({
      where: {
        id: saveId,
      },
      select: {
        id: true,
        currentRound: true,
        selectedTeamId: true,
      },
    });

    if (!gameSave) {
      throw new BadRequestException('Game save not found');
    }

    const leagues = await this.prisma.saveLeague.findMany({
      where: {
        gameSaveId: saveId,
      },
      include: {
        teams: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
        fixtures: {
          include: {
            matchResult: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return leagues.map((league) => {
      const totalRounds =
        league.fixtures.length > 0
          ? Math.max(...league.fixtures.map((fixture) => fixture.roundNumber))
          : 0;

      const playedFixtures = league.fixtures.filter(
        (fixture) => fixture.matchResult !== null,
      ).length;

      const totalFixtures = league.fixtures.length;

      return {
        id: league.id,
        name: league.name,
        country: league.country,
        season: league.season,
        teamCount: league.teams.length,
        totalRounds,
        totalFixtures,
        playedFixtures,
        isSelectedTeamLeague: league.teams.some(
          (team) => team.id === gameSave.selectedTeamId,
        ),
        teams: league.teams,
      };
    });
  }

  async getLeagueDetail(saveId: string, leagueId: string) {
    const { gameSave, league } = await this.getRequiredSaveLeague(saveId, leagueId);

    const teams = await this.prisma.saveTeam.findMany({
      where: {
        gameSaveId: saveId,
        saveLeagueId: league.id,
      },
      select: {
        id: true,
        name: true,
        shortName: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const fixtures = await this.prisma.saveFixture.findMany({
      where: {
        gameSaveId: saveId,
        saveLeagueId: league.id,
      },
      include: {
        matchResult: true,
      },
    });

    const totalRounds =
      fixtures.length > 0
        ? Math.max(...fixtures.map((fixture) => fixture.roundNumber))
        : 0;

    const playedFixtures = fixtures.filter(
      (fixture) => fixture.matchResult !== null,
    ).length;

    const totalFixtures = fixtures.length;

    return {
      league: {
        id: league.id,
        name: league.name,
        country: league.country,
        season: league.season,
        gameSaveId: league.gameSaveId,
      },
      currentRound: gameSave.currentRound,
      teamCount: teams.length,
      totalRounds,
      totalFixtures,
      playedFixtures,
      isSelectedTeamLeague: teams.some(
        (team) => team.id === gameSave.selectedTeamId,
      ),
      teams,
    };
  }

  async getLeagueTeams(saveId: string, leagueId: string) {
    const { gameSave, league } = await this.getRequiredSaveLeague(saveId, leagueId);

    const standings = await this.getSaveStandings(saveId);

    const teams = await this.prisma.saveTeam.findMany({
      where: {
        gameSaveId: saveId,
        saveLeagueId: league.id,
      },
      select: {
        id: true,
        name: true,
        shortName: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const teamsWithStanding = teams.map((team) => {
      const standing = standings.find((item) => item.team.id === team.id);

      return {
        team,
        standing: standing ?? null,
        isSelectedTeam: team.id === gameSave.selectedTeamId,
      };
    });

    return {
      league: {
        id: league.id,
        name: league.name,
        country: league.country,
        season: league.season,
      },
      teams: teamsWithStanding,
    };
  }

  private async getTeamLastPlayedFixtures(saveId: string, teamId: string, limit = 3) {
    const fixtures = await this.prisma.saveFixture.findMany({
      where: {
        gameSaveId: saveId,
        matchResult: {
          isNot: null,
        },
        OR: [
          { homeTeamId: teamId },
          { awayTeamId: teamId },
        ],
      },
      include: {
        matchResult: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
      },
      orderBy: [
        {
          roundNumber: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
      take: limit,
    });

    return fixtures.map((fixture) => this.mapFixtureForResponse(fixture));
  }

  async getSelectedTeamNextMatchContext(saveId: string) {
    const { selectedTeam } = await this.getRequiredSelectedTeam(saveId);
    const standings = await this.getSaveStandings(saveId);

    const nextFixture = await this.prisma.saveFixture.findFirst({
      where: {
        gameSaveId: saveId,
        matchResult: null,
        OR: [
          { homeTeamId: selectedTeam.id },
          { awayTeamId: selectedTeam.id },
        ],
      },
      include: {
        matchResult: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
      },
      orderBy: [
        {
          roundNumber: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],
    });

    if (!nextFixture) {
      throw new BadRequestException('No upcoming fixture found for selected team');
    }

    const opponent =
      nextFixture.homeTeam.id === selectedTeam.id
        ? nextFixture.awayTeam
        : nextFixture.homeTeam;

    const selectedTeamStanding =
      standings.find((item) => item.team.id === selectedTeam.id) ?? null;

    const opponentStanding =
      standings.find((item) => item.team.id === opponent.id) ?? null;

    const selectedTeamLastFixtures = await this.getTeamLastPlayedFixtures(
      saveId,
      selectedTeam.id,
      3,
    );

    const opponentLastFixtures = await this.getTeamLastPlayedFixtures(
      saveId,
      opponent.id,
      3,
    );

    return {
      fixture: this.mapFixtureForResponse(nextFixture),
      selectedTeam: {
        id: selectedTeam.id,
        name: selectedTeam.name,
        shortName: selectedTeam.shortName,
        balance: 50000000,
        budget: 100000000,
      },
      opponent,
      selectedTeamStanding,
      opponentStanding,
      selectedTeamLastFixtures,
      opponentLastFixtures,
    };
  }

  private async getTeamStrength(saveId: string, teamId: string) {
    const players = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId: saveId,
        saveTeamId: teamId,
      },
      select: {
        overall: true,
        role: true,
      },
    });

    if (players.length === 0) {
      return 60;
    }

    const starters = players.filter((player) => player.role === 'starter');
    const relevantPlayers = starters.length > 0 ? starters : players;

    const averageOverall =
      relevantPlayers.reduce((sum, player) => sum + player.overall, 0) /
      relevantPlayers.length;

    return averageOverall;
  }

  private clampGoals(value: number) {
    if (value < 0) {
      return 0;
    }

    if (value > 6) {
      return 6;
    }

    return value;
  }

  private async simulateFixtureScore(saveId: string, homeTeamId: string, awayTeamId: string) {
    const simulation = await this.simulateMatchScore(saveId, homeTeamId, awayTeamId);

    return {
      homeGoals: simulation.homeGoals,
      awayGoals: simulation.awayGoals,
      homeStrength: simulation.homeStrength.overall,
      awayStrength: simulation.awayStrength.overall,
      expectedGoals: simulation.expectedGoals,
    };
  }

  private calculateExpectedGoals(
    attackPower: number,
    defensePower: number,
    isHome: boolean,
  ) {
    const strengthDiff = attackPower - defensePower;

    let expectedGoals = 1.15 + strengthDiff / 28;

    if (isHome) {
      expectedGoals += 0.2;
    }

    expectedGoals += this.randomBetween(-0.35, 0.35);

    return this.clampNumber(expectedGoals, 0.2, 3.4);
  }

  private rollGoalsFromExpected(expectedGoals: number) {
    let goals = 0;

    const firstGoalChance = this.clampNumber(expectedGoals / 3.2, 0.05, 0.95);
    const secondGoalChance = this.clampNumber((expectedGoals - 0.7) / 3.0, 0, 0.8);
    const thirdGoalChance = this.clampNumber((expectedGoals - 1.4) / 3.0, 0, 0.55);
    const fourthGoalChance = this.clampNumber((expectedGoals - 2.1) / 3.2, 0, 0.3);
    const fifthGoalChance = this.clampNumber((expectedGoals - 2.8) / 3.5, 0, 0.15);
    const sixthGoalChance = this.clampNumber((expectedGoals - 3.3) / 4.0, 0, 0.08);

    if (Math.random() < firstGoalChance) goals += 1;
    if (Math.random() < secondGoalChance) goals += 1;
    if (Math.random() < thirdGoalChance) goals += 1;
    if (Math.random() < fourthGoalChance) goals += 1;
    if (Math.random() < fifthGoalChance) goals += 1;
    if (Math.random() < sixthGoalChance) goals += 1;

    return goals;
  }

  async getCurrentRoundActionSummary(saveId: string) {
    const { gameSave, myFixture, fixtures, totalRounds } =
      await this.getCurrentRoundContext(saveId);

    const roundProgress = this.getRoundProgressFromFixtures(fixtures);
    const myMatch = this.mapFixtureForResponse(myFixture);

    const otherFixtures = fixtures.filter((fixture) => fixture.id !== myFixture.id);
    const playedOtherFixtures = otherFixtures
      .filter((fixture) => fixture.matchResult !== null)
      .map((fixture) => this.mapFixtureForResponse(fixture));

    const remainingOtherFixtures = otherFixtures
      .filter((fixture) => fixture.matchResult === null)
      .map((fixture) => this.mapFixtureForResponse(fixture));

    const myMatchPlayed = myFixture.matchResult !== null;
    const canPlayMyMatch = !myMatchPlayed;
    const canSimulateRemainingFixtures =
      myMatchPlayed && remainingOtherFixtures.length > 0;
    const canCompleteCurrentRound = roundProgress.remainingFixtures > 0;

    let recommendedNextAction: 'PLAY_MY_MATCH' | 'SIMULATE_REST' | 'ROUND_FINISHED' =
      'ROUND_FINISHED';

    if (canPlayMyMatch) {
      recommendedNextAction = 'PLAY_MY_MATCH';
    } else if (canSimulateRemainingFixtures) {
      recommendedNextAction = 'SIMULATE_REST';
    }

    return {
      season: {
        currentRound: gameSave.currentRound,
        totalRounds,
        isSeasonFinished: false,
      },
      round: {
        roundNumber: gameSave.currentRound,
        totalFixtures: roundProgress.totalFixtures,
        playedFixtures: roundProgress.playedFixtures,
        remainingFixtures: roundProgress.remainingFixtures,
        isRoundFinished: roundProgress.isRoundFinished,
      },
      myMatch: {
        isPlayed: myMatchPlayed,
        fixture: myMatch,
      },
      otherMatches: {
        playedCount: playedOtherFixtures.length,
        remainingCount: remainingOtherFixtures.length,
        played: playedOtherFixtures,
        remaining: remainingOtherFixtures,
      },
      actions: {
        canPlayMyMatch,
        canSimulateRemainingFixtures,
        canCompleteCurrentRound,
        recommendedNextAction,
      },
    };
  }

  async getCurrentRoundOtherResults(saveId: string) {
    const { gameSave, myFixture, fixtures } = await this.getCurrentRoundContext(saveId);

    const otherFixtures = fixtures.filter((fixture) => fixture.id !== myFixture.id);

    const playedOtherFixtures = otherFixtures
      .filter((fixture) => fixture.matchResult !== null)
      .map((fixture) => this.mapFixtureForResponse(fixture));

    const unplayedOtherFixtures = otherFixtures
      .filter((fixture) => fixture.matchResult === null)
      .map((fixture) => this.mapFixtureForResponse(fixture));

    return {
      roundNumber: gameSave.currentRound,
      totalOtherFixtures: otherFixtures.length,
      playedOtherFixturesCount: playedOtherFixtures.length,
      remainingOtherFixturesCount: unplayedOtherFixtures.length,
      played: playedOtherFixtures,
      remaining: unplayedOtherFixtures,
    };
  }

  async getCurrentRoundMyMatchResult(saveId: string) {
    const { gameSave, myFixture } = await this.getCurrentRoundContext(saveId);

    const fixtureResponse = this.mapFixtureForResponse(myFixture);

    return {
      roundNumber: gameSave.currentRound,
      hasMyMatch: true,
      isPlayed: fixtureResponse.isPlayed,
      result: fixtureResponse.isPlayed ? fixtureResponse : null,
      fixture: fixtureResponse,
    };
  }

  private getRoundProgressFromFixtures(
    fixtures: Array<{
      id: string;
      matchResult: {
        id: string;
        homeGoals: number;
        awayGoals: number;
        playedAt: Date;
      } | null;
    }>,
  ) {
    const totalFixtures = fixtures.length;
    const playedFixtures = fixtures.filter((fixture) => fixture.matchResult !== null).length;
    const remainingFixtures = totalFixtures - playedFixtures;

    return {
      totalFixtures,
      playedFixtures,
      remainingFixtures,
      isRoundFinished: remainingFixtures === 0,
    };
  }

  private async getRequiredSavePlayer(saveId: string, playerId: string) {
    const player = await this.prisma.savePlayer.findFirst({
      where: {
        id: playerId,
        gameSaveId: saveId,
      },
      select: {
        id: true,
        name: true,
        age: true,
        position: true,
        overall: true,
        pace: true,
        shooting: true,
        passing: true,
        dribbling: true,
        defending: true,
        physical: true,
        role: true,
        lineupPosition: true,
        lineupSlot: true,
        isTransferListed: true,
        marketValue: true,
        saveTeamId: true,
        gameSaveId: true,
      },
    });

    if (!player) {
      throw new BadRequestException('Player not found in this save');
    }

    return player;
  }

  async updatePlayerRole(saveId: string, playerId: string, role: string) {
    const allowedRoles = ['starter', 'bench', 'reserve'];

    if (!allowedRoles.includes(role)) {
      throw new BadRequestException(
        'Invalid role. Allowed values: starter, bench, reserve',
      );
    }

    await this.getRequiredSavePlayer(saveId, playerId);

    const updatedPlayer = await this.prisma.savePlayer.update({
      where: {
        id: playerId,
      },
      data: {
        role,
      },
      select: {
        id: true,
        name: true,
        age: true,
        position: true,
        overall: true,
        pace: true,
        shooting: true,
        passing: true,
        dribbling: true,
        defending: true,
        physical: true,
        role: true,
        lineupPosition: true,
        lineupSlot: true,
        isTransferListed: true,
        marketValue: true,
        saveTeamId: true,
        gameSaveId: true,
      },
    });

    return {
      message: 'Player role updated successfully',
      player: this.mapPlayerForResponse(updatedPlayer),
    };
  }

  async updatePlayerLineupPosition(
    saveId: string,
    playerId: string,
    lineupPosition: string | null,
  ) {
    const allowedPositions = [
      'GK',
      'LB',
      'CB',
      'RB',
      'CDM',
      'CM',
      'CAM',
      'LW',
      'RW',
      'ST',
    ];

    if (lineupPosition !== null && !allowedPositions.includes(lineupPosition)) {
      throw new BadRequestException(
        'Invalid lineupPosition. Allowed values: GK, LB, CB, RB, CDM, CM, CAM, LW, RW, ST, or null',
      );
    }

    await this.getRequiredSavePlayer(saveId, playerId);

    const updatedPlayer = await this.prisma.savePlayer.update({
      where: {
        id: playerId,
      },
      data: {
        lineupPosition,
      },
      select: {
        id: true,
        name: true,
        age: true,
        position: true,
        overall: true,
        pace: true,
        shooting: true,
        passing: true,
        dribbling: true,
        defending: true,
        physical: true,
        role: true,
        lineupPosition: true,
        lineupSlot: true,
        isTransferListed: true,
        marketValue: true,
        saveTeamId: true,
        gameSaveId: true,
      },
    });

    return {
      message: 'Player lineup position updated successfully',
      player: this.mapPlayerForResponse(updatedPlayer),
    };
  }

  async updatePlayerTransferListStatus(
    saveId: string,
    playerId: string,
    isTransferListed: boolean,
  ) {
    await this.getRequiredSavePlayer(saveId, playerId);

    const updatedPlayer = await this.prisma.savePlayer.update({
      where: {
        id: playerId,
      },
      data: isTransferListed
        ? {
            isTransferListed: true,
            role: 'reserve',
            lineupPosition: null,
            lineupSlot: null,
          }
        : {
            isTransferListed: false,
          },
      select: {
        id: true,
        name: true,
        age: true,
        position: true,
        overall: true,
        pace: true,
        shooting: true,
        passing: true,
        dribbling: true,
        defending: true,
        physical: true,
        role: true,
        lineupPosition: true,
        lineupSlot: true,
        isTransferListed: true,
        marketValue: true,
        goalsScored: true,
        saveTeamId: true,
        gameSaveId: true,
      },
    });

    return {
      message: 'Player transfer list status updated successfully',
      player: this.mapPlayerForResponse(updatedPlayer),
    };
  }

  async getTransferListedPlayers(saveId: string) {
    const gameSave = await this.prisma.gameSave.findUnique({
      where: {
        id: saveId,
      },
      select: {
        id: true,
        selectedTeamId: true,
      },
    });

    if (!gameSave) {
      throw new BadRequestException('Game save not found');
    }

    const players = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId: saveId,
        isTransferListed: true,
      },
      include: {
        saveTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
      },
      orderBy: [
        {
          marketValue: 'desc',
        },
        {
          overall: 'desc',
        },
        {
          name: 'asc',
        },
      ],
    });

    return {
      totalPlayers: players.length,
      players: players.map((player) => ({
        id: player.id,
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
        isTransferListed: player.isTransferListed,
        marketValue: player.marketValue,
        team: player.saveTeam,
        isFromSelectedTeam: player.saveTeamId === gameSave.selectedTeamId,
      })),
    };
  }

  private async ensureTeamLineupPersisted(gameSaveId: string, saveTeamId: string) {
    const team = await this.prisma.saveTeam.findFirst({
      where: {
        id: saveTeamId,
        gameSaveId,
      },
      select: {
        id: true,
        formation: true,
      },
    });

    if (!team) {
      throw new BadRequestException('Team not found');
    }

    const formation = isSupportedFormation(team.formation)
      ? (team.formation as SupportedFormation)
      : '4-3-3';

    const players = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId,
        saveTeamId,
      },
      orderBy: [
        { overall: 'desc' },
        { name: 'asc' },
      ],
    });

    const starters = players.filter((player) => player.role === 'starter');

    const hasPersistedSlots =
      starters.length === 11 &&
      starters.every((player) => player.lineupSlot && player.lineupPosition);

    if (hasPersistedSlots) {
      return;
    }

    const assignments = this.buildBestLineupAssignments(players, formation);
    const starterIds = new Set(assignments.map((assignment) => assignment.playerId));

    await this.prisma.savePlayer.updateMany({
      where: {
        gameSaveId,
        saveTeamId,
      },
      data: {
        role: 'reserve',
        lineupPosition: null,
        lineupSlot: null,
      },
    });

    for (const assignment of assignments) {
      const slotDefinition = getSlotDefinition(formation, assignment.lineupSlot);

      if (!slotDefinition) continue;

      await this.prisma.savePlayer.update({
        where: {
          id: assignment.playerId,
        },
        data: {
          role: 'starter',
          lineupSlot: assignment.lineupSlot,
          lineupPosition: slotDefinition.tacticalPosition,
        },
      });
    }

    const benchPlayers = players
      .filter((player) => !starterIds.has(player.id))
      .sort((a, b) => b.overall - a.overall)
      .slice(0, 7);

    for (const player of benchPlayers) {
      await this.prisma.savePlayer.update({
        where: {
          id: player.id,
        },
        data: {
          role: 'bench',
          lineupPosition: null,
          lineupSlot: null,
        },
      });
    }
  }

  async getSelectedTeamTransferListedPlayers(saveId: string) {
    const { selectedTeam } = await this.getRequiredSelectedTeam(saveId);

    const players = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId: saveId,
        saveTeamId: selectedTeam.id,
        isTransferListed: true,
      },
      orderBy: [
        {
          marketValue: 'desc',
        },
        {
          overall: 'desc',
        },
        {
          name: 'asc',
        },
      ],
      select: {
        id: true,
        name: true,
        age: true,
        position: true,
        overall: true,
        pace: true,
        shooting: true,
        passing: true,
        dribbling: true,
        defending: true,
        physical: true,
        role: true,
        lineupPosition: true,
        lineupSlot: true,
        isTransferListed: true,
        marketValue: true,
      },
    });

    return {
      team: {
        id: selectedTeam.id,
        name: selectedTeam.name,
        shortName: selectedTeam.shortName,
      },
      totalPlayers: players.length,
      players,
    };
  }

  async buyTransferListedPlayer(saveId: string, playerId: string) {
    const { selectedTeam } = await this.getRequiredSelectedTeam(saveId);

    const player = await this.prisma.savePlayer.findFirst({
      where: {
        id: playerId,
        gameSaveId: saveId,
      },
      include: {
        saveTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            budget: true,
          },
        },
      },
    });

    if (!player) {
      throw new BadRequestException('Player not found in this save');
    }

    if (!player.isTransferListed) {
      throw new BadRequestException('Player is not transfer listed');
    }

    if (player.saveTeamId === selectedTeam.id) {
      throw new BadRequestException('Selected team cannot buy its own player');
    }

    if (selectedTeam.budget < player.marketValue) {
      throw new BadRequestException('Not enough budget to buy this player');
    }

    if (player.saveTeamId === selectedTeam.id) {
      throw new BadRequestException('Selected team cannot buy its own player');
    }

    if (!player.isTransferListed) {
      throw new BadRequestException('Player is not transfer listed');
    }

    if (selectedTeam.budget < player.marketValue) {
      throw new BadRequestException('Not enough budget to buy this player');
    }

    const updatedPlayer = await this.prisma.$transaction(async (tx) => {
      await tx.saveTeam.update({
        where: {
          id: selectedTeam.id,
        },
        data: {
          budget: {
            decrement: player.marketValue,
          },
        },
      });

      await tx.saveTeam.update({
        where: {
          id: player.saveTeamId,
        },
        data: {
          budget: {
            increment: player.marketValue,
          },
        },
      });

      const transferredPlayer = await tx.savePlayer.update({
        where: {
          id: player.id,
        },
        data: {
          saveTeamId: selectedTeam.id,
          isTransferListed: false,
          role: 'reserve',
          lineupPosition: null,
          lineupSlot: null,
        },
        select: {
          id: true,
          name: true,
          age: true,
          position: true,
          overall: true,
          pace: true,
          shooting: true,
          passing: true,
          dribbling: true,
          defending: true,
          physical: true,
          role: true,
          lineupPosition: true,
          lineupSlot: true,
          isTransferListed: true,
          marketValue: true,
          saveTeamId: true,
          gameSaveId: true,
        },
      });

      await tx.transferHistory.create({
        data: {
          gameSaveId: saveId,
          playerId: player.id,
          fromSaveTeamId: player.saveTeamId,
          toSaveTeamId: selectedTeam.id,
          type: 'BOUGHT',
          marketValue: player.marketValue,
        },
      });

      return transferredPlayer;
    });

    return {
      message: 'Player bought successfully',
      previousTeam: player.saveTeam,
      newTeam: {
        id: selectedTeam.id,
        name: selectedTeam.name,
        shortName: selectedTeam.shortName,
      },
      player: this.mapPlayerForResponse(updatedPlayer),
    };
  }

  async playSingleMatch(saveId: string, fixtureId: string) {
    const fixture = await this.prisma.saveFixture.findFirst({
      where: {
        id: fixtureId,
        gameSaveId: saveId,
      },
      include: {
        matchResult: {
          include: {
            events: {
              orderBy: {
                minute: 'asc',
              },
            },
          },
        },
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            formation: true,
          },
        },
      },
    });

    if (!fixture) {
      throw new BadRequestException('Fixture not found in this save');
    }

    if (fixture.matchResult) {
      throw new BadRequestException('This match has already been played');
    }

    const simulation = await this.simulateMatchScore(
      saveId,
      fixture.homeTeamId,
      fixture.awayTeamId,
    );

    const matchResult = await this.saveMatchResult(
      saveId,
      fixture.id,
      simulation.homeGoals,
      simulation.awayGoals,
    );

    await this.generateMatchEvents(
      matchResult.id,
      saveId,
      fixture.homeTeamId,
      fixture.awayTeamId,
      simulation.homeGoals,
      simulation.awayGoals,
    );

    await this.tryAdvanceRoundIfRoundFinished(saveId, fixture.roundNumber);
    
    const updatedFixture = await this.prisma.saveFixture.findUnique({
      where: {
        id: fixture.id,
      },
      include: {
        matchResult: {
          include: {
            events: {
              orderBy: {
                minute: 'asc',
              },
            },
          },
        },
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
      },
    });

    if (!updatedFixture || !updatedFixture.matchResult) {
      throw new BadRequestException('Played fixture could not be loaded');
    }

    if (!updatedFixture || !updatedFixture.matchResult) {
      throw new BadRequestException('Played fixture could not be loaded');
    }

    const updatedSeasonState = await this.getSeasonState(saveId);

    return {
      message: 'Match played successfully',
      fixture: this.mapFixtureForResponse(updatedFixture),
      result: {
        fixtureId: updatedFixture.id,
        roundNumber: updatedFixture.roundNumber,
        homeTeam: updatedFixture.homeTeam,
        awayTeam: updatedFixture.awayTeam,
        homeGoals: updatedFixture.matchResult.homeGoals,
        awayGoals: updatedFixture.matchResult.awayGoals,
        winner: this.getWinnerLabel(
          updatedFixture.matchResult.homeGoals,
          updatedFixture.matchResult.awayGoals,
        ),
        playedAt: updatedFixture.matchResult.playedAt,
      },
      simulation: {
        expectedGoals: simulation.expectedGoals,
        homeStrength: simulation.homeStrength,
        awayStrength: simulation.awayStrength,
      },
      seasonState: updatedSeasonState,
      events: updatedFixture.matchResult.events,
    };
  }


  private randomBetween(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  private clampNumber(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  private getPoissonRandom(lambda: number) {
    const safeLambda = Math.max(0.05, lambda);
    const l = Math.exp(-safeLambda);
    let k = 0;
    let p = 1;

    do {
      k++;
      p *= Math.random();
    } while (p > l);

    return k - 1;
  }

  private simulateFatigueAndSubstitutions(
    lineup: any[],
    bench: any[],
    teamSide: 'home' | 'away',
  ) {
    const events: any[] = [];
    const finalLineup = [...lineup];
    const finalBench = [...bench];

    const substitutionMinutes = [60, 70, 80];

    for (const minute of substitutionMinutes) {
      const tiredPlayerIndex = finalLineup
        .map((player, index) => ({ player, index }))
        .sort((a, b) => {
          const staminaA = a.player.stamina ?? 100;
          const staminaB = b.player.stamina ?? 100;
          return staminaA - staminaB;
        })[0]?.index;

      if (tiredPlayerIndex === undefined || finalBench.length === 0) continue;

      const tiredPlayer = finalLineup[tiredPlayerIndex];
      const replacementIndex = finalBench.findIndex(
        (player) =>
          player.position === tiredPlayer.position ||
          player.lineupPosition === tiredPlayer.lineupPosition,
      );

      const selectedBenchIndex = replacementIndex >= 0 ? replacementIndex : 0;
      const replacement = finalBench[selectedBenchIndex];

      if (!replacement) continue;

      finalLineup[tiredPlayerIndex] = {
        ...replacement,
        tacticalPosition: tiredPlayer.tacticalPosition,
        playedPosition: tiredPlayer.playedPosition,
        positionMultiplier: this.getSquadPageFitMultiplier(
          replacement.position,
          tiredPlayer.tacticalPosition,
        ),
        stamina: 100,
        effectiveOverall: Math.round(
          replacement.overall *
            this.getSquadPageFitMultiplier(
              replacement.position,
              tiredPlayer.tacticalPosition,
            ),
        ),
      };

      finalBench.splice(selectedBenchIndex, 1);

      events.push({
        minute,
        type: 'SUBSTITUTION',
        teamSide,
        playerOut: {
          id: tiredPlayer.id,
          name: tiredPlayer.name,
          position: tiredPlayer.position,
        },
        playerIn: {
          id: replacement.id,
          name: replacement.name,
          position: replacement.position,
        },
      });
    }

    const fatiguedLineup = finalLineup.map((player) => {
      const staminaLoss = this.randomBetween(18, 38);
      const stamina = Math.max(45, Math.round((player.stamina ?? 100) - staminaLoss));
      const fatiguePenalty = Math.round((100 - stamina) / 10);

      return {
        ...player,
        stamina,
        effectiveOverall: Math.max(
          40,
          Math.round((player.overall * (player.positionMultiplier ?? 1)) - fatiguePenalty),
        ),
      };
    });

    return {
      lineup: fatiguedLineup,
      bench: finalBench,
      events,
    };
  }

  private async buildMatchTeamSnapshot(gameSaveId: string, saveTeamId: string) {
    const team = await this.prisma.saveTeam.findUnique({
      where: {
        id: saveTeamId,
      },
      select: {
        id: true,
        name: true,
        shortName: true,
        formation: true,
      },
    });

    const formation = isSupportedFormation(team?.formation ?? '')
      ? (team?.formation as SupportedFormation)
      : '4-3-3';

    const players = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId,
        saveTeamId,
        isTransferListed: false,
      },
      select: {
        id: true,
        name: true,
        position: true,
        overall: true,
        pace: true,
        shooting: true,
        passing: true,
        dribbling: true,
        defending: true,
        physical: true,
        role: true,
        lineupPosition: true,
        lineupSlot: true,
        goalsScored: true,
      },
    });

    const slots = getFormationSlots(formation);
    const usedPlayerIds = new Set<string>();

    const lineup = slots
      .map((slot) => {
        const player =
          players.find(
            (item) =>
              item.role === 'starter' &&
              item.lineupSlot === slot.slotId &&
              !usedPlayerIds.has(item.id),
          ) ||
          players.find(
            (item) =>
              item.role === 'starter' &&
              item.lineupPosition === slot.tacticalPosition &&
              !usedPlayerIds.has(item.id),
          );

        if (!player) return null;

        usedPlayerIds.add(player.id);

        const multiplier = this.getSquadPageFitMultiplier(
          player.position,
          slot.tacticalPosition,
        );

        return {
          ...player,
          lineupSlot: slot.slotId,
          tacticalPosition: slot.tacticalPosition,
          playedPosition: slot.tacticalPosition,
          positionMultiplier: multiplier,
          stamina: 100,
          effectiveOverall: Math.round(player.overall * multiplier),
        };
      })
      .filter(Boolean);

    const bench = players
      .filter((player) => player.role === 'bench' && !usedPlayerIds.has(player.id))
      .slice(0, 7)
      .map((player) => ({
        ...player,
        tacticalPosition: player.position,
        playedPosition: player.position,
        positionMultiplier: 1,
        stamina: 100,
        effectiveOverall: player.overall,
      }));

    return {
      team,
      formation,
      lineup,
      bench,
    };
  }

  private getSquadPageFitMultiplier(playerPosition: string, tacticalPosition: string) {
    if (playerPosition === tacticalPosition) {
      return 1;
    }

    const midfieldPositions = ['CM', 'CDM', 'CAM'];

    if (
      midfieldPositions.includes(playerPosition) &&
      midfieldPositions.includes(tacticalPosition)
    ) {
      return 0.9;
    }

    return 0.75;
  }

  private async getTeamMatchStrength(saveId: string, saveTeamId: string) {
    const players = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId: saveId,
        saveTeamId,
      },
      select: {
        id: true,
        name: true,
        position: true,
        overall: true,
        role: true,
        lineupSlot: true,
      },
      orderBy: [
        { overall: 'desc' },
        { name: 'asc' },
      ],
    });

    const starters = players.filter((player) => player.role === 'starter');

    if (starters.length === 0) {
      const fallbackPlayers = players.slice(0, 11);
      const fallbackAverage = this.safeAverage(
        fallbackPlayers.map((player) => player.overall),
      );

      return this.applyTacticStyleToStrengths(
        {
          overall: Math.round(fallbackAverage || 60),
          defense: Math.round(fallbackAverage || 60),
          midfield: Math.round(fallbackAverage || 60),
          attack: Math.round(fallbackAverage || 60),
        },
        'balanced',
      );
    }

    const team = await this.prisma.saveTeam.findUnique({
      where: {
        id: saveTeamId,
      },
      select: {
        formation: true,
        tacticStyle: true,
      },
    });

    const formation = isSupportedFormation(team?.formation ?? '')
      ? (team?.formation as SupportedFormation)
      : '4-3-3';

    const starterWithSlots = starters.map((player) => {
      const slotDefinition = player.lineupSlot
        ? getSlotDefinition(formation, player.lineupSlot)
        : null;

      const tacticalPosition =
        slotDefinition?.tacticalPosition ?? (player.position as PlayerPosition);

      const multiplier = getPositionCompatibilityMultiplier(
        player.position as PlayerPosition,
        tacticalPosition,
      );

      const effectiveOverall = Math.round(player.overall * multiplier);

      return {
        ...player,
        tacticalPosition,
        multiplier,
        effectiveOverall,
      };
    });

    const defensePositions: PlayerPosition[] = ['GK', 'LB', 'CB', 'RB'];
    const midfieldPositions: PlayerPosition[] = ['CDM', 'CM', 'CAM'];
    const attackPositions: PlayerPosition[] = ['LW', 'RW', 'ST'];

    const defense = Math.round(
      this.safeAverage(
        starterWithSlots
          .filter((player) =>
            defensePositions.includes(player.tacticalPosition as PlayerPosition),
          )
          .map((player) => player.effectiveOverall),
      ) || 60,
    );

    const midfield = Math.round(
      this.safeAverage(
        starterWithSlots
          .filter((player) =>
            midfieldPositions.includes(player.tacticalPosition as PlayerPosition),
          )
          .map((player) => player.effectiveOverall),
      ) || 60,
    );

    const attack = Math.round(
      this.safeAverage(
        starterWithSlots
          .filter((player) =>
            attackPositions.includes(player.tacticalPosition as PlayerPosition),
          )
          .map((player) => player.effectiveOverall),
      ) || 60,
    );

    const overall = Math.round(
      this.safeAverage(starterWithSlots.map((player) => player.effectiveOverall)) || 60,
    );

    return this.applyTacticStyleToStrengths(
      {
        overall,
        defense,
        midfield,
        attack,
      },
      team?.tacticStyle ?? 'balanced',
    );
  }  

  private applyTacticStyleToStrengths(
    strengths: {
      overall: number;
      defense: number;
      midfield: number;
      attack: number;
    },
    tacticStyle: string,
  ) {
    let defense = strengths.defense;
    let midfield = strengths.midfield;
    let attack = strengths.attack;

    if (tacticStyle === 'attacking') {
      attack += 5;
      midfield += 1;
      defense -= 3;
    }

    if (tacticStyle === 'defensive') {
      defense += 5;
      midfield += 1;
      attack -= 3;
    }

    defense = this.clampNumber(defense, 40, 99);
    midfield = this.clampNumber(midfield, 40, 99);
    attack = this.clampNumber(attack, 40, 99);

    return {
      overall: Math.round((defense + midfield + attack) / 3),
      defense,
      midfield,
      attack,
      tacticStyle,
    };
  }

  private async simulateMatchScore(
    saveId: string,
    homeTeamId: string,
    awayTeamId: string,
  ) {
    const [homeStrength, awayStrength] = await Promise.all([
      this.getTeamMatchStrength(saveId, homeTeamId),
      this.getTeamMatchStrength(saveId, awayTeamId),
    ]);

    const homeAttackFactor = homeStrength.attack / Math.max(1, awayStrength.defense);
    const awayAttackFactor = awayStrength.attack / Math.max(1, homeStrength.defense);

    const homeMidfieldFactor = homeStrength.midfield / Math.max(1, awayStrength.midfield);
    const awayMidfieldFactor = awayStrength.midfield / Math.max(1, homeStrength.midfield);

    const homeBaseXg =
      1.25 +
      (homeAttackFactor - 1) * 1.1 +
      (homeMidfieldFactor - 1) * 0.45 +
      0.22;

    const awayBaseXg =
      1.05 +
      (awayAttackFactor - 1) * 1.05 +
      (awayMidfieldFactor - 1) * 0.4;

    const homeRandomModifier = this.randomBetween(-0.35, 0.45);
    const awayRandomModifier = this.randomBetween(-0.35, 0.35);

    const homeLambda = this.clampNumber(homeBaseXg + homeRandomModifier, 0.2, 4.2);
    const awayLambda = this.clampNumber(awayBaseXg + awayRandomModifier, 0.15, 4.0);

    const homeGoals = this.clampNumber(this.getPoissonRandom(homeLambda), 0, 7);
    const awayGoals = this.clampNumber(this.getPoissonRandom(awayLambda), 0, 7);

    const homeLineupData = await this.getTeamMatchSnapshot(saveId, homeTeamId);
    const awayLineupData = await this.getTeamMatchSnapshot(saveId, awayTeamId);

    const goalscorers = [
      ...this.generateGoalEvents(homeGoals, 'home', homeLineupData.lineup),
      ...this.generateGoalEvents(awayGoals, 'away', awayLineupData.lineup),
    ].sort((a, b) => a.minute - b.minute);

    const substitutions = [
      ...this.generateSubstitutionEvents('home', homeLineupData.lineup, homeLineupData.bench),
      ...this.generateSubstitutionEvents('away', awayLineupData.lineup, awayLineupData.bench),
    ].sort((a, b) => a.minute - b.minute);

    return {
      homeGoals,
      awayGoals,
      homeStrength,
      awayStrength,
      expectedGoals: {
        home: this.roundToOne(homeLambda),
        away: this.roundToOne(awayLambda),
      },
      matchSummary: {
        homeFormation: homeLineupData.formation,
        awayFormation: awayLineupData.formation,
        homeLineup: homeLineupData.lineup,
        awayLineup: awayLineupData.lineup,
        homeBench: homeLineupData.bench,
        awayBench: awayLineupData.bench,
        goalscorers,
        substitutions,
      },
    };
  }

  private async getTeamMatchSnapshot(saveId: string, teamId: string) {
    const team = await this.prisma.saveTeam.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        shortName: true,
        formation: true,
      },
    });

    const players = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId: saveId,
        saveTeamId: teamId,
      },
      select: {
        id: true,
        name: true,
        age: true,
        position: true,
        overall: true,
        pace: true,
        shooting: true,
        passing: true,
        dribbling: true,
        defending: true,
        physical: true,
        role: true,
        lineupPosition: true,
        lineupSlot: true,
        isTransferListed: true,
        marketValue: true,
        saveTeamId: true,
        gameSaveId: true,
      },
      orderBy: [
        { role: 'asc' },
        { overall: 'desc' },
        { name: 'asc' },
      ],
    });

    const starters = players
      .filter((player) => player.role === 'starter')
      .slice(0, 11);

    const bench = players.filter((player) => player.role === 'bench');

    return {
      team,
      formation: team?.formation ?? '4-3-3',
      lineup: starters.map((player) => ({
        ...this.mapPlayerForResponse(player),
        playedPosition: player.lineupPosition ?? player.position,
        tacticalPosition: player.lineupPosition ?? player.position,
      })),
      bench: bench.map((player) => this.mapPlayerForResponse(player)),
    };
  }

  private generateGoalEvents(
    goalCount: number,
    teamSide: 'home' | 'away',
    lineup: Array<any>,
  ) {
    const attackingPlayers = lineup.filter((player) =>
      ['ST', 'LW', 'RW', 'CAM', 'CM'].includes(player.position),
    );

    const candidates = attackingPlayers.length > 0 ? attackingPlayers : lineup;

    return Array.from({ length: goalCount }).map((_, index) => {
      const player = candidates[Math.floor(Math.random() * candidates.length)];
      const minute = this.getRandomMatchMinute(index, goalCount);

      return {
        minute,
        teamSide,
        player,
        playerName: player?.name ?? 'Unknown player',
      };
    });
  }

  private generateSubstitutionEvents(
    teamSide: 'home' | 'away',
    lineup: Array<any>,
    bench: Array<any>,
  ) {
    if (!lineup.length || !bench.length) {
      return [];
    }

    const substitutionCount = Math.min(3, bench.length, lineup.length);

    return Array.from({ length: substitutionCount }).map((_, index) => {
      const playerOut = lineup[lineup.length - 1 - index];
      const playerIn = bench[index];

      return {
        minute: 60 + index * 8 + Math.floor(Math.random() * 6),
        teamSide,
        playerOut,
        playerIn,
        playerOutName: playerOut?.name ?? 'Unknown player',
        playerInName: playerIn?.name ?? 'Unknown player',
      };
    });
  }

  private getRandomMatchMinute(index: number, totalGoals: number) {
    const baseMinute = Math.floor(Math.random() * 80) + 5;
    return Math.min(90, Math.max(1, baseMinute + index * 2));
  }

  private async generateMatchEvents(
    matchResultId: string,
    saveId: string,
    homeTeamId: string,
    awayTeamId: string,
    homeGoals: number,
    awayGoals: number,
  ) {
    const [homePlayers, awayPlayers] = await Promise.all([
      this.prisma.savePlayer.findMany({
        where: {
          gameSaveId: saveId,
          saveTeamId: homeTeamId,
          role: 'starter',
          position: {
            in: ['ST', 'LW', 'RW', 'CAM', 'CM'],
          },
        },
        orderBy: [{ shooting: 'desc' }, { overall: 'desc' }],
      }),
      this.prisma.savePlayer.findMany({
        where: {
          gameSaveId: saveId,
          saveTeamId: awayTeamId,
          role: 'starter',
          position: {
            in: ['ST', 'LW', 'RW', 'CAM', 'CM'],
          },
        },
        orderBy: [{ shooting: 'desc' }, { overall: 'desc' }],
      }),
    ]);

    const events: Array<{
      minute: number;
      type: string;
      teamSide: string;
      playerName?: string;
      playerInName?: string;
      playerOutName?: string;
    }> = [];

    const createGoalEvents = (
      count: number,
      teamSide: 'home' | 'away',
      players: typeof homePlayers,
    ) => {
      for (let i = 0; i < count; i++) {
        const scorer = players[Math.floor(Math.random() * Math.max(players.length, 1))];

        if (!scorer) continue;

        events.push({
          minute: Math.floor(this.randomBetween(8, 88)),
          type: 'GOAL',
          teamSide,
          playerName: scorer.name,
        });
      }
    };

    createGoalEvents(homeGoals, 'home', homePlayers);
    createGoalEvents(awayGoals, 'away', awayPlayers);

    const sortedEvents = events.sort((a, b) => a.minute - b.minute);

    if (sortedEvents.length > 0) {
      await this.prisma.matchEvent.createMany({
        data: sortedEvents.map((event) => ({
          ...event,
          matchResultId,
        })),
      });
    }

    return sortedEvents;
  }

  private getWinnerLabel(homeGoals: number, awayGoals: number) {
    if (homeGoals > awayGoals) {
      return 'HOME';
    }

    if (awayGoals > homeGoals) {
      return 'AWAY';
    }

    return 'DRAW';
  }

  async listAnySavePlayerForTransfer(saveId: string, playerId: string) {
    const player = await this.prisma.savePlayer.findFirst({
      where: {
        id: playerId,
        gameSaveId: saveId,
      },
      include: {
        saveTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
      },
    });

    if (!player) {
      throw new BadRequestException('Player not found in this save');
    }

    if (player.isTransferListed) {
      throw new BadRequestException('Player is already transfer listed');
    }

    const updatedPlayer = await this.prisma.savePlayer.update({
      where: {
        id: player.id,
      },
      data: {
        isTransferListed: true,
      },
      select: {
        id: true,
        name: true,
        age: true,
        position: true,
        overall: true,
        pace: true,
        shooting: true,
        passing: true,
        dribbling: true,
        defending: true,
        physical: true,
        role: true,
        lineupPosition: true,
        lineupSlot: true,
        isTransferListed: true,
        marketValue: true,
        saveTeamId: true,
        gameSaveId: true,
      },
    });

    await this.createTransferHistoryEntry({
      gameSaveId: saveId,
      playerId: player.id,
      fromSaveTeamId: player.saveTeamId,
      toSaveTeamId: null,
      type: 'LISTED',
      marketValue: player.marketValue,
    });

    return {
      message: 'Player listed for transfer successfully',
      team: player.saveTeam,
      player: this.mapPlayerForResponse(updatedPlayer),
    };
  }

  async removeAnySavePlayerFromTransferList(saveId: string, playerId: string) {
    const player = await this.prisma.savePlayer.findFirst({
      where: {
        id: playerId,
        gameSaveId: saveId,
      },
      include: {
        saveTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
      },
    });

    if (!player) {
      throw new BadRequestException('Player not found in this save');
    }

    if (!player.isTransferListed) {
      throw new BadRequestException('Player is not transfer listed');
    }

    const updatedPlayer = await this.prisma.savePlayer.update({
      where: {
        id: player.id,
      },
      data: {
        isTransferListed: false,
      },
      select: {
        id: true,
        name: true,
        age: true,
        position: true,
        overall: true,
        pace: true,
        shooting: true,
        passing: true,
        dribbling: true,
        defending: true,
        physical: true,
        role: true,
        lineupPosition: true,
        lineupSlot: true,
        isTransferListed: true,
        marketValue: true,
        saveTeamId: true,
        gameSaveId: true,
      },
    });

    await this.createTransferHistoryEntry({
      gameSaveId: saveId,
      playerId: player.id,
      fromSaveTeamId: player.saveTeamId,
      toSaveTeamId: player.saveTeamId,
      type: 'UNLISTED',
      marketValue: player.marketValue,
    });

    return {
      message: 'Player removed from transfer list successfully',
      team: player.saveTeam,
      player: this.mapPlayerForResponse(updatedPlayer),
    };
  }

  async getTransferHistory(saveId: string) {
    const history = await this.prisma.transferHistory.findMany({
      where: {
        gameSaveId: saveId,
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            position: true,
            overall: true,
            marketValue: true,
          },
        },
        fromSaveTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
        toSaveTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      total: history.length,
      items: history.map((entry) => ({
        id: entry.id,
        createdAt: entry.createdAt,
        type: entry.type,
        marketValue: entry.marketValue,
        player: entry.player,
        fromTeam: entry.fromSaveTeam,
        toTeam: entry.toSaveTeam,
      })),
    };
  }

  async resetDemoWorld() {
    await this.prisma.matchResult.deleteMany();
    await this.prisma.saveStanding.deleteMany();
    await this.prisma.saveFixture.deleteMany();
    await this.prisma.savePlayer.deleteMany();
    await this.prisma.saveTeam.deleteMany();
    await this.prisma.saveLeague.deleteMany();
    await this.prisma.gameSave.deleteMany();

    await this.prisma.baseFixtureTemplate.deleteMany();
    await this.prisma.basePlayer.deleteMany();
    await this.prisma.baseTeam.deleteMany();
    await this.prisma.baseLeague.deleteMany();

    return {
      message: 'Demo world reset successfully',
    };
  }

  async bootstrapDemoWorld() {
    await this.ensureDemoWorldIsEmpty();

    const teamsResult = await this.seedBaseTeams();
    const leagueResult = await this.seedBaseLeague();
    const playersResult = await this.seedBasePlayers();
    const fixturesResult = await this.seedBaseFixtureTemplates();

    return {
      message: 'Demo world bootstrapped successfully',
      summary: {
        teams: teamsResult.teamCount,
        league: leagueResult.league.name,
        players: playersResult.playerCount,
        averagePlayersPerTeam: playersResult.averagePlayersPerTeam,
        fixtureTemplates: fixturesResult.fixtureTemplateCount,
      },
    };
  }

  private getPlayerOverallForSorting(player: {
    overall: number;
  }) {
    return player.overall;
  }

  private buildBestLineupAssignments(
    players: Array<{
      id: string;
      name: string;
      age: number;
      position: string;
      overall: number;
      pace: number;
      shooting: number;
      passing: number;
      dribbling: number;
      defending: number;
      physical: number;
      role: string;
      lineupPosition: string | null;
      lineupSlot: string | null;
      isTransferListed: boolean;
      marketValue: number;
      saveTeamId: string;
      gameSaveId: string;
    }>,
    formation: SupportedFormation,
  ) {
    const slots = getFormationSlots(formation);
    const usedPlayerIds = new Set<string>();

    const slotPriority: Record<PlayerPosition, number> = {
      GK: 1,
      ST: 2,
      LW: 3,
      RW: 4,
      LB: 5,
      RB: 6,
      CB: 7,
      CDM: 8,
      CM: 9,
      CAM: 10,
    };

    const orderedSlots = [...slots].sort((a, b) => {
      return (
        (slotPriority[a.tacticalPosition] ?? 99) -
        (slotPriority[b.tacticalPosition] ?? 99)
      );
    });

    const assignments: Array<{
      playerId: string;
      lineupSlot: string;
      tacticalPosition: PlayerPosition;
      multiplier: number;
      score: number;
    }> = [];

    for (const slot of orderedSlots) {
      const candidates = players
        .filter((player) => !usedPlayerIds.has(player.id))
        .map((player) => {
          const multiplier = getPositionCompatibilityMultiplier(
            player.position as PlayerPosition,
            slot.tacticalPosition,
          );

          const isNaturalPosition = player.position === slot.tacticalPosition;

          const score =
            isNaturalPosition
              ? player.overall + 1000
              : player.overall * multiplier - (1 - multiplier) * 300;

          return {
            player,
            multiplier,
            score,
            isNaturalPosition,
          };
        })
        .filter((item) => item.multiplier > 0)
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if (b.isNaturalPosition !== a.isNaturalPosition) {
            return Number(b.isNaturalPosition) - Number(a.isNaturalPosition);
          }
          if (b.multiplier !== a.multiplier) return b.multiplier - a.multiplier;
          return b.player.overall - a.player.overall;
        });

      const bestCandidate = candidates[0];

      if (!bestCandidate) {
        throw new BadRequestException(
          `Could not find a valid player for slot ${slot.slotId} (${slot.tacticalPosition})`,
        );
      }

      usedPlayerIds.add(bestCandidate.player.id);

      assignments.push({
        playerId: bestCandidate.player.id,
        lineupSlot: slot.slotId,
        tacticalPosition: slot.tacticalPosition,
        multiplier: bestCandidate.multiplier,
        score: bestCandidate.score,
      });
    }

    return assignments;
  }

  private async applySelectedTeamLineupState(
    saveId: string,
    selectedTeamId: string,
    formation: SupportedFormation,
    starters: Array<{ playerId: string; lineupSlot: string }>,
    benchPlayerIds: string[] = [],
  ) {
    const teamPlayers = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId: saveId,
        saveTeamId: selectedTeamId,
      },
      select: {
        id: true,
      },
    });

    const starterIds = new Set(starters.map((item) => item.playerId));
    const benchIds = new Set(benchPlayerIds);

    const reserveIds = teamPlayers
      .filter(
        (player) => !starterIds.has(player.id) && !benchIds.has(player.id),
      )
      .map((player) => player.id);

    await this.prisma.$transaction(async (tx) => {
      await tx.saveTeam.update({
        where: {
          id: selectedTeamId,
        },
        data: {
          formation,
        },
      });

      await tx.savePlayer.updateMany({
        where: {
          gameSaveId: saveId,
          saveTeamId: selectedTeamId,
        },
        data: {
          role: 'reserve',
          lineupPosition: null,
          lineupSlot: null,
        },
      });

      if (benchPlayerIds.length > 0) {
        await tx.savePlayer.updateMany({
          where: {
            id: {
              in: benchPlayerIds,
            },
          },
          data: {
            role: 'bench',
            lineupPosition: null,
            lineupSlot: null,
          },
        });
      }

      if (reserveIds.length > 0) {
        await tx.savePlayer.updateMany({
          where: {
            id: {
              in: reserveIds,
            },
          },
          data: {
            role: 'reserve',
            lineupPosition: null,
            lineupSlot: null,
          },
        });
      }

      for (const starter of starters) {
        const slotDefinition = getSlotDefinition(formation, starter.lineupSlot);

        if (!slotDefinition) {
          throw new BadRequestException(
            `Invalid slot ${starter.lineupSlot} for formation ${formation}`,
          );
        }

        await tx.savePlayer.update({
          where: {
            id: starter.playerId,
          },
          data: {
            role: 'starter',
            lineupPosition: slotDefinition.tacticalPosition,
            lineupSlot: slotDefinition.slotId,
          },
        });
      }
    });
  }

  async autoPickSelectedTeamLineup(saveId: string) {
    const { selectedTeam } = await this.getRequiredSelectedTeam(saveId);

    const formation = isSupportedFormation(selectedTeam.formation)
      ? (selectedTeam.formation as SupportedFormation)
      : '4-3-3';

    const players = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId: saveId,
        saveTeamId: selectedTeam.id,
      },
      select: {
        id: true,
        name: true,
        age: true,
        position: true,
        overall: true,
        pace: true,
        shooting: true,
        passing: true,
        dribbling: true,
        defending: true,
        physical: true,
        role: true,
        lineupPosition: true,
        lineupSlot: true,
        isTransferListed: true,
        marketValue: true,
        saveTeamId: true,
        gameSaveId: true,
      },
      orderBy: [
        { overall: 'desc' },
        { name: 'asc' },
      ],
    });

    if (players.length < 11) {
      throw new BadRequestException(
        'Selected team does not have enough players to build a lineup',
      );
    }

    const assignments = this.buildBestLineupAssignments(players, formation);
    const starterIds = new Set(assignments.map((item) => item.playerId));

    const benchPlayerIds = players
      .filter((player) => !starterIds.has(player.id))
      .sort((a, b) => b.overall - a.overall)
      .slice(0, 7)
      .map((player) => player.id);

    await this.applySelectedTeamLineupState(
      saveId,
      selectedTeam.id,
      formation,
      assignments.map((item) => ({
        playerId: item.playerId,
        lineupSlot: item.lineupSlot,
      })),
      benchPlayerIds,
    );

    return {
      message: 'Selected team lineup auto-picked successfully',
      formation,
      assignments,
      lineup: await this.getSelectedTeamLineup(saveId),
    };
  }

  async updateSelectedTeamFormation(saveId: string, formation: string) {
        
    const { selectedTeam } = await this.getRequiredSelectedTeam(saveId);

    if (!isSupportedFormation(formation)) {
      throw new BadRequestException(
        `Invalid formation. Allowed values: ${SUPPORTED_FORMATIONS.join(', ')}`,
      );
    }

    await this.prisma.saveTeam.update({
      where: {
        id: selectedTeam.id,
      },
      data: {
        formation,
      },
    });

    await this.prisma.savePlayer.updateMany({
      where: {
        gameSaveId: saveId,
        saveTeamId: selectedTeam.id,
      },
      data: {
        role: 'reserve',
        lineupPosition: null,
        lineupSlot: null,
      },
    });

    return this.autoPickSelectedTeamLineup(saveId);
  }

  private mapPlayerForResponse(player: {
    id: string;
    name: string;
    age: number;
    position: string;
    overall: number;
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
    role: string;
    lineupPosition: string | null;
    lineupSlot: string | null;
    isTransferListed: boolean;
    marketValue: number;
    saveTeamId: string;
    gameSaveId: string;
  }) {
    return {
      id: player.id,
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
      lineupSlot: player.lineupSlot,
      isTransferListed: player.isTransferListed,
      marketValue: player.marketValue,
      saveTeamId: player.saveTeamId,
      gameSaveId: player.gameSaveId,
    };
  }
  
  private getEffectiveOverall(overall: number, multiplier: number) {
    return Math.round(overall * multiplier);
  }

  private mapLineupPlayer(
    player: {
      id: string;
      name: string;
      age: number;
      position: string;
      overall: number;
      pace: number;
      shooting: number;
      passing: number;
      dribbling: number;
      defending: number;
      physical: number;
      role: string;
      lineupPosition: string | null;
      lineupSlot: string | null;
      isTransferListed: boolean;
      marketValue: number;
      saveTeamId: string;
      gameSaveId: string;
    },
    tacticalPosition: PlayerPosition,
  ) {
    const multiplier = getPositionCompatibilityMultiplier(
      player.position as PlayerPosition,
      tacticalPosition,
    );

    return {
      ...this.mapPlayerForResponse(player),
      tacticalPosition,
      positionMultiplier: multiplier,
      fitLabel: getFitLabel(multiplier),
      effectiveOverall: this.getEffectiveOverall(player.overall, multiplier),
      canPlayInSlot: multiplier > 0,
    };
  }

  private assignLegacySlotsToStarters(
    players: Array<{
      id: string;
      name: string;
      age: number;
      position: string;
      overall: number;
      pace: number;
      shooting: number;
      passing: number;
      dribbling: number;
      defending: number;
      physical: number;
      role: string;
      lineupPosition: string | null;
      lineupSlot: string | null;
      isTransferListed: boolean;
      marketValue: number;
      saveTeamId: string;
      gameSaveId: string;
    }>,
    formation: SupportedFormation,
  ) {
    const slots = getFormationSlots(formation);
    const usedSlotIds = new Set<string>();
    const slotAssignments = new Map<
      string,
      {
        slotId: string;
        tacticalPosition: PlayerPosition;
      }
    >();

    for (const player of players) {
      if (player.lineupSlot) {
        const slot = slots.find((item) => item.slotId === player.lineupSlot);

        if (slot && !usedSlotIds.has(slot.slotId)) {
          usedSlotIds.add(slot.slotId);
          slotAssignments.set(player.id, {
            slotId: slot.slotId,
            tacticalPosition: slot.tacticalPosition,
          });
        }
      }
    }

    const unassignedPlayers = players.filter((player) => !slotAssignments.has(player.id));
    const remainingSlots = () => slots.filter((slot) => !usedSlotIds.has(slot.slotId));

    for (const player of unassignedPlayers) {
      let chosenSlot =
        remainingSlots().find(
          (slot) => slot.tacticalPosition === player.lineupPosition,
        ) ??
        remainingSlots().find(
          (slot) => slot.tacticalPosition === player.position,
        );

      if (!chosenSlot) {
        const candidates = remainingSlots()
          .map((slot) => ({
            slot,
            multiplier: getPositionCompatibilityMultiplier(
              player.position as PlayerPosition,
              slot.tacticalPosition,
            ),
          }))
          .filter((item) => item.multiplier > 0)
          .sort((a, b) => b.multiplier - a.multiplier);

        chosenSlot = candidates[0]?.slot;
      }

      if (chosenSlot) {
        usedSlotIds.add(chosenSlot.slotId);
        slotAssignments.set(player.id, {
          slotId: chosenSlot.slotId,
          tacticalPosition: chosenSlot.tacticalPosition,
        });
      }
    }

    return slotAssignments;
  }

  async getSelectedTeamLineup(saveId: string) {
    const { selectedTeam } = await this.getRequiredSelectedTeam(saveId);

    const formation = isSupportedFormation(selectedTeam.formation)
      ? (selectedTeam.formation as SupportedFormation)
      : '4-3-3';

    const players = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId: saveId,
        saveTeamId: selectedTeam.id,
      },
      select: {
        id: true,
        name: true,
        age: true,
        position: true,
        overall: true,
        pace: true,
        shooting: true,
        passing: true,
        dribbling: true,
        defending: true,
        physical: true,
        role: true,
        lineupPosition: true,
        lineupSlot: true,
        isTransferListed: true,
        marketValue: true,
        saveTeamId: true,
        gameSaveId: true,
      },
      orderBy: [
        { overall: 'desc' },
        { name: 'asc' },
      ],
    });

    const formationSlots = getFormationSlots(formation);
    const starters = players.filter((player) => player.role === 'starter');
    const bench = players.filter((player) => player.role === 'bench');
    const reserve = players.filter((player) => player.role === 'reserve');

    const hasPersistedLineupSlots = starters.some((player) => player.lineupSlot !== null);

    const slotAssignments = hasPersistedLineupSlots
      ? new Map(
          starters
            .filter((player) => player.lineupSlot !== null)
            .map((player) => [
              player.id,
              {
                slotId: player.lineupSlot as string,
                tacticalPosition:
                  getSlotDefinition(formation, player.lineupSlot as string)
                    ?.tacticalPosition ?? (player.position as PlayerPosition),
              },
            ]),
        )
      : this.assignLegacySlotsToStarters(starters, formation);

    const startersBySlot = formationSlots.map((slot) => {
      const assignedPlayer = starters.find((player) => {
        const assignment = slotAssignments.get(player.id);
        return assignment?.slotId === slot.slotId;
      });

      return {
        slotId: slot.slotId,
        tacticalPosition: slot.tacticalPosition,
        player: assignedPlayer
          ? this.mapLineupPlayer(assignedPlayer, slot.tacticalPosition)
          : null,
      };
    });

    const starterCount = starters.length;
    const isCompleteLineup =
      starterCount === 11 &&
      startersBySlot.every((slot) => slot.player !== null) &&
      startersBySlot.filter((slot) => slot.tacticalPosition === 'GK' && slot.player).length === 1;

    const sortByOverallDesc = <T extends { overall: number; name: string }>(
      items: T[],
    ) =>
      [...items].sort((a, b) => {
        if (b.overall !== a.overall) {
          return b.overall - a.overall;
        }

        return a.name.localeCompare(b.name);
      });

    return {
      team: {
        id: selectedTeam.id,
        name: selectedTeam.name,
        shortName: selectedTeam.shortName,
        formation,
      },
      supportedFormations: SUPPORTED_FORMATIONS,
      lineup: {
        formation,
        slots: startersBySlot,
        starterCount,
        benchCount: bench.length,
        reserveCount: reserve.length,
        isCompleteLineup,
      },
      bench: sortByOverallDesc(
        bench.map((player) =>
          this.mapLineupPlayer(player, player.position as PlayerPosition),
        ),
      ),
      reserve: sortByOverallDesc(
        reserve.map((player) =>
          this.mapLineupPlayer(player, player.position as PlayerPosition),
        ),
      ),
      allPlayers: sortByOverallDesc(
        players.map((player) =>
          this.mapLineupPlayer(player, player.position as PlayerPosition),
        ),
      ),
    };
  }

  async saveSelectedTeamLineup(
    saveId: string,
    body: {
      formation: string;
      starters: Array<{ playerId: string; lineupSlot: string }>;
      benchPlayerIds?: string[];
      reservePlayerIds?: string[];
    },
  ) {
    const { selectedTeam } = await this.getRequiredSelectedTeam(saveId);

    if (!isSupportedFormation(body.formation)) {
      throw new BadRequestException(
        `Invalid formation. Allowed values: ${SUPPORTED_FORMATIONS.join(', ')}`,
      );
    }

    const formation = body.formation as SupportedFormation;
    const formationSlots = getFormationSlots(formation);

    if (!Array.isArray(body.starters) || body.starters.length !== 11) {
      throw new BadRequestException('Exactly 11 starters are required');
    }

    const benchPlayerIds = body.benchPlayerIds ?? [];
    const reservePlayerIds = body.reservePlayerIds ?? [];

    const starterPlayerIds = body.starters.map((item) => item.playerId);
    const starterSlotIds = body.starters.map((item) => item.lineupSlot);

    const duplicateStarterPlayerIds = starterPlayerIds.filter(
      (id, index) => starterPlayerIds.indexOf(id) !== index,
    );

    const selectedPlayerIds = [
    ...(body.starters ?? []).map((item) => item.playerId),
    ...(body.benchPlayerIds ?? []),
    ];

    const listedPlayers = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId: saveId,
        id: {
          in: selectedPlayerIds,
        },
        isTransferListed: true,
      },
      select: {
        name: true,
      },
    });

    if (listedPlayers.length > 0) {
      throw new BadRequestException(
        `Transfer listed players cannot be in the lineup or bench: ${listedPlayers
          .map((player) => player.name)
          .join(', ')}`,
      );
    }

    if (duplicateStarterPlayerIds.length > 0) {
      throw new BadRequestException('Starter players must be unique');
    }

    const duplicateSlotIds = starterSlotIds.filter(
      (id, index) => starterSlotIds.indexOf(id) !== index,
    );

    if (duplicateSlotIds.length > 0) {
      throw new BadRequestException('Lineup slots must be unique');
    }

    const allowedSlotIds = formationSlots.map((slot) => slot.slotId);

    const invalidSlotIds = starterSlotIds.filter((slotId) => !allowedSlotIds.includes(slotId as any));

    if (invalidSlotIds.length > 0) {
      throw new BadRequestException(
        `Invalid lineupSlot values for formation ${formation}: ${invalidSlotIds.join(', ')}`,
      );
    }

    const missingSlotIds = allowedSlotIds.filter((slotId) => !starterSlotIds.includes(slotId));

    if (missingSlotIds.length > 0) {
      throw new BadRequestException(
        `Missing lineup slots for formation ${formation}: ${missingSlotIds.join(', ')}`,
      );
    }

    const allExplicitIds = [...starterPlayerIds, ...benchPlayerIds, ...reservePlayerIds];

    const duplicateExplicitPlayerIds = allExplicitIds.filter(
      (id, index) => allExplicitIds.indexOf(id) !== index,
    );

    if (duplicateExplicitPlayerIds.length > 0) {
      throw new BadRequestException(
        'A player cannot appear in multiple lineup groups',
      );
    }

    const teamPlayers = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId: saveId,
        saveTeamId: selectedTeam.id,
      },
      select: {
        id: true,
        name: true,
        age: true,
        position: true,
        overall: true,
        pace: true,
        shooting: true,
        passing: true,
        dribbling: true,
        defending: true,
        physical: true,
        role: true,
        lineupPosition: true,
        lineupSlot: true,
        isTransferListed: true,
        marketValue: true,
        saveTeamId: true,
        gameSaveId: true,
      },
    });

    const teamPlayerIds = new Set(teamPlayers.map((player) => player.id));

    for (const explicitPlayerId of allExplicitIds) {
      if (!teamPlayerIds.has(explicitPlayerId)) {
        throw new BadRequestException(
          `Player ${explicitPlayerId} does not belong to selected team`,
        );
      }
    }

    for (const starter of body.starters) {
      const player = teamPlayers.find((item) => item.id === starter.playerId);

      if (!player) {
        throw new BadRequestException(`Starter player ${starter.playerId} not found`);
      }

      const slotDefinition = getSlotDefinition(formation, starter.lineupSlot);

      if (!slotDefinition) {
        throw new BadRequestException(
          `Invalid slot ${starter.lineupSlot} for formation ${formation}`,
        );
      }

      const multiplier = getPositionCompatibilityMultiplier(
        player.position as PlayerPosition,
        slotDefinition.tacticalPosition,
      );

      if (multiplier <= 0) {
        throw new BadRequestException(
          `Player ${player.name} (${player.position}) cannot play in slot ${starter.lineupSlot} (${slotDefinition.tacticalPosition})`,
        );
      }
    }

    const gkStarterCount = body.starters.filter((starter) => starter.lineupSlot === 'GK').length;

    if (gkStarterCount !== 1) {
      throw new BadRequestException('Exactly one GK slot must be assigned');
    }

    const explicitReserveIds = new Set(reservePlayerIds);
    const explicitBenchIds = new Set(benchPlayerIds);
    const explicitStarterIds = new Set(starterPlayerIds);

    const leftoverReserveIds = teamPlayers
      .filter(
        (player) =>
          !explicitStarterIds.has(player.id) &&
          !explicitBenchIds.has(player.id) &&
          !explicitReserveIds.has(player.id),
      )
      .map((player) => player.id);

    const finalReserveIds = [...reservePlayerIds, ...leftoverReserveIds];

    await this.applySelectedTeamLineupState(
      saveId,
      selectedTeam.id,
      formation,
      body.starters,
      benchPlayerIds,
    );

    return this.getSelectedTeamLineup(saveId);
  }

  async buyMarketPlayer(saveId: string, playerId: string) {
    return this.buyTransferListedPlayer(saveId, playerId);
  }

  async removeSelectedTeamPlayerFromTransferList(saveId: string, playerId: string) {
    const { selectedTeam } = await this.getRequiredSelectedTeam(saveId);
    const player = await this.getRequiredSavePlayer(saveId, playerId);

    if (player.saveTeamId !== selectedTeam.id) {
      throw new BadRequestException('Player does not belong to selected team');
    }

    if (!player.isTransferListed) {
      throw new BadRequestException('Player is not transfer listed');
    }

    const updatedPlayer = await this.prisma.savePlayer.update({
      where: {
        id: player.id,
      },
      data: {
        isTransferListed: false,
      },
      select: {
        id: true,
        name: true,
        age: true,
        position: true,
        overall: true,
        pace: true,
        shooting: true,
        passing: true,
        dribbling: true,
        defending: true,
        physical: true,
        role: true,
        lineupPosition: true,
        lineupSlot: true,
        isTransferListed: true,
        marketValue: true,
        saveTeamId: true,
        gameSaveId: true,
      },
    });

    await this.createTransferHistoryEntry({
      gameSaveId: saveId,
      playerId: player.id,
      fromSaveTeamId: selectedTeam.id,
      toSaveTeamId: selectedTeam.id,
      type: 'UNLISTED',
      marketValue: player.marketValue,
    });

    return {
      message: 'Player removed from transfer list successfully',
      player: this.mapPlayerForResponse(updatedPlayer),
    };
  }

  async listSelectedTeamPlayerForTransfer(saveId: string, playerId: string) {
    const { selectedTeam } = await this.getRequiredSelectedTeam(saveId);
    const player = await this.getRequiredSavePlayer(saveId, playerId);

    if (player.saveTeamId !== selectedTeam.id) {
      throw new BadRequestException('Player does not belong to selected team');
    }

    if (player.isTransferListed) {
      throw new BadRequestException('Player is already transfer listed');
    }

    const updatedPlayer = await this.prisma.savePlayer.update({
      where: {
        id: player.id,
      },
      data: {
        isTransferListed: true,
      },
      select: {
        id: true,
        name: true,
        age: true,
        position: true,
        overall: true,
        pace: true,
        shooting: true,
        passing: true,
        dribbling: true,
        defending: true,
        physical: true,
        role: true,
        lineupPosition: true,
        lineupSlot: true,
        isTransferListed: true,
        marketValue: true,
        saveTeamId: true,
        gameSaveId: true,
      },
    });

    await this.createTransferHistoryEntry({
      gameSaveId: saveId,
      playerId: player.id,
      fromSaveTeamId: selectedTeam.id,
      toSaveTeamId: null,
      type: 'LISTED',
      marketValue: player.marketValue,
    });

    return {
      message: 'Player listed for transfer successfully',
      player: this.mapPlayerForResponse(updatedPlayer),
    };
  }

  async getSeasonSummary(saveId: string) {
    const { gameSave, totalRounds, isFinished } = await this.getSeasonMeta(saveId);

    const [
      table,
      championResult,
      selectedTeam,
      selectedTeamStanding,
      totalFixtures,
      playedFixtures,
      selectedTeamLastFixtures,
    ] = await Promise.all([
      this.getSaveStandings(saveId),
      this.getSeasonChampion(saveId),
      gameSave.selectedTeamId
        ? this.prisma.saveTeam.findUnique({
            where: {
              id: gameSave.selectedTeamId,
            },
            select: {
              id: true,
              name: true,
              shortName: true,
              formation: true,
            },
          })
        : Promise.resolve(null),
      this.getSelectedTeamStanding(saveId).catch(() => null),
      this.prisma.saveFixture.count({
        where: {
          gameSaveId: saveId,
        },
      }),
      this.prisma.saveFixture.count({
        where: {
          gameSaveId: saveId,
          matchResult: {
            isNot: null,
          },
        },
      }),
      this.getSelectedTeamLastFixtures(saveId).catch(() => []),
    ]);

    const topScoringTeam = [...table].sort((a, b) => b.goalsFor - a.goalsFor)[0] ?? null;
    const bestDefenseTeam = [...table].sort((a, b) => a.goalsAgainst - b.goalsAgainst)[0] ?? null;

    return {
      save: {
        id: gameSave.id,
        name: gameSave.name,
      },
      season: {
        totalRounds,
        currentRound: gameSave.currentRound,
        isFinished,
        totalFixtures,
        playedFixtures,
      },
      champion: championResult.champion,
      selectedTeam,
      selectedTeamStanding,
      highlights: {
        topScoringTeam,
        bestDefenseTeam,
      },
      finalTable: table,
      selectedTeamRecentResults: selectedTeamLastFixtures.slice(0, 5),
    };
  }

  async getSeasonChampion(saveId: string) {
    const { gameSave, totalRounds, isFinished } = await this.getSeasonMeta(saveId);
    const table = await this.getSaveStandings(saveId);

    if (table.length === 0) {
      throw new BadRequestException('No standings found for this save');
    }

    const champion = table[0];
    const isSelectedTeamChampion = champion.team.id === gameSave.selectedTeamId;

    return {
      save: {
        id: gameSave.id,
        name: gameSave.name,
      },
      season: {
        totalRounds,
        currentRound: gameSave.currentRound,
        isFinished,
      },
      champion,
      isSelectedTeamChampion,
    };
  }

  async getSeasonFinalTable(saveId: string) {
    const { gameSave, totalRounds, isFinished } = await this.getSeasonMeta(saveId);
    const table = await this.getSaveStandings(saveId);

    return {
      save: {
        id: gameSave.id,
        name: gameSave.name,
      },
      season: {
        totalRounds,
        currentRound: gameSave.currentRound,
        isFinished,
      },
      finalTable: table,
    };
  }

  private async getRequiredGameSave(saveId: string) {
    const gameSave = await this.prisma.gameSave.findUnique({
      where: {
        id: saveId,
      },
      select: {
        id: true,
        name: true,
        currentRound: true,
        selectedTeamId: true,
      },
    });

    if (!gameSave) {
      throw new BadRequestException('Game save not found');
    }

    return gameSave;
  }

  private async getSeasonMeta(saveId: string) {
    const gameSave = await this.getRequiredGameSave(saveId);
    const totalRounds = await this.getGameSaveTotalRounds(saveId);
    const isFinished = totalRounds > 0 && gameSave.currentRound > totalRounds;

    return {
      gameSave,
      totalRounds,
      isFinished,
    };
  }

  async getMarketPlayers(saveId: string) {
    const { selectedTeam } = await this.getRequiredSelectedTeam(saveId);

    const players = await this.prisma.savePlayer.findMany({
      where: {
        gameSaveId: saveId,
        isTransferListed: true,
        saveTeamId: {
          not: selectedTeam.id,
        },
      },
      include: {
        saveTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
      },
      orderBy: [
        { marketValue: 'desc' },
        { overall: 'desc' },
        { name: 'asc' },
      ],
    });

    return {
      selectedTeam: {
        id: selectedTeam.id,
        name: selectedTeam.name,
        shortName: selectedTeam.shortName,
        balance: 50000000,
        budget: 100000000,
      },
      totalPlayers: players.length,
      players: players.map((player) => ({
        id: player.id,
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
        lineupSlot: player.lineupSlot,
        isTransferListed: player.isTransferListed,
        marketValue: player.marketValue,
        team: player.saveTeam,
      })),
    };
  }
  
  private mapFixtureForResponse(fixture: any) {
    const isPlayed = Boolean(fixture.matchResult);

    const mapSummaryPlayers = (players: any[] = []) =>
      players.map((p) => ({
        ...p,
        playedPosition:
          p.playedPosition ||
          p.tacticalPosition ||
          p.lineupPosition ||
          p.position,
        tacticalPosition:
          p.tacticalPosition ||
          p.playedPosition ||
          p.lineupPosition ||
          p.position,
      }));

    const savedSummary = fixture.matchResult?.matchSummary ?? {};

    const events = fixture.matchResult?.events ?? savedSummary.events ?? [];

    const goalscorers =
      savedSummary.goalscorers ??
      events.filter((event: any) => event.type === 'GOAL');

    const substitutions =
      savedSummary.substitutions ??
      events.filter((event: any) => event.type === 'SUBSTITUTION');

    return {
      id: fixture.id,
      roundNumber: fixture.roundNumber,
      createdAt: fixture.createdAt,

      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,

      isPlayed,
      homeGoals: fixture.matchResult?.homeGoals ?? null,
      awayGoals: fixture.matchResult?.awayGoals ?? null,
      playedAt: fixture.matchResult?.playedAt ?? null,

      matchSummary: isPlayed
        ? {
            homeFormation:
              fixture.matchResult.homeFormation ??
              savedSummary.homeFormation ??
              null,

            awayFormation:
              fixture.matchResult.awayFormation ??
              savedSummary.awayFormation ??
              null,

            homeLineup: mapSummaryPlayers(
              fixture.matchResult.homeLineup ??
                savedSummary.homeLineup ??
                [],
            ),

            awayLineup: mapSummaryPlayers(
              fixture.matchResult.awayLineup ??
                savedSummary.awayLineup ??
                [],
            ),

            homeBench:
              fixture.matchResult.homeBench ??
              savedSummary.homeBench ??
              [],

            awayBench:
              fixture.matchResult.awayBench ??
              savedSummary.awayBench ??
              [],

            events,
            goalscorers,
            substitutions,
          }
        : null,
    };
  }

  private async createTransferHistoryEntry(params: {
    gameSaveId: string;
    playerId: string;
    fromSaveTeamId?: string | null;
    toSaveTeamId?: string | null;
    type: 'LISTED' | 'UNLISTED' | 'BOUGHT';
    marketValue: number;
  }) {
    return this.prisma.transferHistory.create({
      data: {
        gameSaveId: params.gameSaveId,
        playerId: params.playerId,
        fromSaveTeamId: params.fromSaveTeamId ?? null,
        toSaveTeamId: params.toSaveTeamId ?? null,
        type: params.type,
        marketValue: params.marketValue,
      },
    });
  }
}

