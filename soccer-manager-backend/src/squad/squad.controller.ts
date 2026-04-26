import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { SquadService } from './squad.service';
import { SaveLineupDto } from '../users/dto/save-lineup.dto';
import { UpdateFormationDto } from './dto/update-formation.dto';

@Controller('squad')
export class SquadController {
  constructor(private readonly squadService: SquadService) {}

  @Patch('saves/:saveId/selected-team/formation')
  async updateSelectedTeamFormation(
    @Param('saveId') saveId: string,
    @Body() body: UpdateFormationDto,
  ) {
    console.log("FORMATION CONTROLLER BODY:", body);
    console.log("FORMATION CONTROLLER VALUE:", body.formation);

    return this.squadService.updateSelectedTeamFormation(saveId, body.formation);
  }

  @Get('saves/:saveId/selected-team/lineup')
  async getSelectedTeamLineup(@Param('saveId') saveId: string) {
    return this.squadService.getSelectedTeamLineup(saveId);
  }

  @Put('saves/:saveId/selected-team/lineup')
  async saveSelectedTeamLineup(
    @Param('saveId') saveId: string,
    @Body() body: SaveLineupDto,
  ) {
    return this.squadService.saveSelectedTeamLineup(saveId, body);
  }

  @Post('saves/:saveId/selected-team/lineup/auto-pick')
  async autoPickSelectedTeamLineup(@Param('saveId') saveId: string) {
    return this.squadService.autoPickSelectedTeamLineup(saveId);
  }

  @Get('saves/:saveId/selected-team/summary')
  async getSelectedTeamSummary(@Param('saveId') saveId: string) {
    return this.squadService.getSelectedTeamSummary(saveId);
  }

  @Get('saves/:saveId/selected-team/team-overall')
  async getSelectedTeamOverall(@Param('saveId') saveId: string) {
    return this.squadService.getSelectedTeamOverall(saveId);
  }

  @Get('saves/:saveId/selected-team/club-snapshot')
  async getSelectedTeamClubSnapshot(@Param('saveId') saveId: string) {
    return this.squadService.getSelectedTeamClubSnapshot(saveId);
  }
}