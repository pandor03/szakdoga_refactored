import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class SquadService {
  constructor(private readonly usersService: UsersService) {}

  async getSelectedTeamLineup(saveId: string) {
    return this.usersService.getSelectedTeamLineup(saveId);
  }

  async saveSelectedTeamLineup(saveId: string, body: { formation: string; starters: Array<{ playerId: string; lineupSlot: string }> }) {
    return this.usersService.saveSelectedTeamLineup(saveId, body);
  }

  async autoPickSelectedTeamLineup(saveId: string) {
    return this.usersService.autoPickSelectedTeamLineup(saveId);
  }

  async getSelectedTeamSummary(saveId: string) {
    return this.usersService.getSelectedTeamSummary(saveId);
  }

  async getSelectedTeamOverall(saveId: string) {
    return this.usersService.getSelectedTeamOverall(saveId);
  }

  async getSelectedTeamClubSnapshot(saveId: string) {
    return this.usersService.getSelectedTeamClubSnapshot(saveId);
  }

  async updateSelectedTeamFormation(saveId: string, formation: string) {
    console.log("FORMATION SQUAD SERVICE VALUE:", formation);

    return this.usersService.updateSelectedTeamFormation(saveId, formation);
  }
}