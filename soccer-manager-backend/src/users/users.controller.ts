import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateGameSaveDto } from './dto/create-game-save.dto';
import { RenameSaveDto } from './dto/rename-save.dto';
import { SaveMatchResultDto } from './dto/save-match-result.dto';
import { PlaySelectedTeamMatchDto } from './dto/play-selected-team-match.dto';
import { UpdatePlayerRoleDto } from './dto/update-player-role.dto';
import { UpdatePlayerLineupPositionDto } from './dto/update-player-lineup-position.dto';
import { UpdatePlayerTransferListStatusDto } from './dto/update-player-transfer-list-status.dto';
import { SaveLineupDto } from './dto/save-lineup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { SavesService } from '../saves/saves.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly savesService: SavesService,
  ) {}

  @Post()
  async createUser(@Body() body: CreateUserDto) {
    return this.savesService.createUser(body);
  }

  @Get('saves/:saveId/teams')
  async getSaveTeams(@Param('saveId') saveId: string) {
    return this.usersService.getSaveTeams(saveId);
  }

  @Get('base/teams-with-players')
  async getBaseTeamsWithPlayers() {
    return this.usersService.getBaseTeamsWithPlayers();
  }

  @Get('saves/:saveId/teams-with-players')
  async getSaveTeamsWithPlayers(@Param('saveId') saveId: string) {
    return this.usersService.getSaveTeamsWithPlayers(saveId);
  }

  @Get('base/leagues-with-teams')
  async getBaseLeaguesWithTeams() {
    return this.usersService.getBaseLeaguesWithTeams();
  }

  @Get('saves/:saveId/leagues-with-teams')
  async getSaveLeaguesWithTeams(@Param('saveId') saveId: string) {
    return this.usersService.getSaveLeaguesWithTeams(saveId);
  }

  @Get('base/leagues-with-fixtures')
  async getBaseLeaguesWithFixtureTemplates() {
    return this.usersService.getBaseLeaguesWithFixtureTemplates();
  }

  @Get('saves/:saveId/fixtures')
  async getSaveFixtures(@Param('saveId') saveId: string) {
    return this.usersService.getSaveFixtures(saveId);
  }

  @Get('saves/:saveId/standings')
  async getSaveStandings(@Param('saveId') saveId: string) {
    return this.usersService.getSaveStandings(saveId);
  }

  @Get('saves/:saveId')
  async getGameSave(@Param('saveId') saveId: string) {
    return this.usersService.getGameSave(saveId);
  }

  @Get('saves/:saveId/season-state')
  async getSeasonState(@Param('saveId') saveId: string) {
    return this.usersService.getSeasonState(saveId);
  }

  @Get('saves/:saveId/current-round/fixtures')
  async getCurrentRoundFixtures(@Param('saveId') saveId: string) {
    return this.usersService.getCurrentRoundFixtures(saveId);
  }

  @Get('saves/:saveId/last-round/fixtures')
  async getLastRoundFixtures(@Param('saveId') saveId: string) {
    return this.usersService.getLastRoundFixtures(saveId);
  }

  @Get('saves/:saveId/dashboard')
  async getDashboard(@Param('saveId') saveId: string) {
    return this.usersService.getDashboard(saveId);
  }

  @Get('saves/:saveId/selected-team')
  async getSelectedTeam(@Param('saveId') saveId: string) {
    return this.usersService.getSelectedTeam(saveId);
  }

  @Get('saves/:saveId/selected-team/players')
  async getSelectedTeamPlayers(@Param('saveId') saveId: string) {
    return this.usersService.getSelectedTeamPlayers(saveId);
  }

  @Get('saves/:saveId/selected-team/standing')
  async getSelectedTeamStanding(@Param('saveId') saveId: string) {
    return this.usersService.getSelectedTeamStanding(saveId);
  }

  @Get('saves/:saveId/selected-team/upcoming-fixtures')
  async getSelectedTeamUpcomingFixtures(@Param('saveId') saveId: string) {
    return this.usersService.getSelectedTeamUpcomingFixtures(saveId);
  }

  @Get('saves/:saveId/selected-team/last-fixtures')
  async getSelectedTeamLastFixtures(@Param('saveId') saveId: string) {
    return this.usersService.getSelectedTeamLastFixtures(saveId);
  }

  @Get('saves/:saveId/selected-team/next-fixture')
  async getSelectedTeamNextFixture(@Param('saveId') saveId: string) {
    return this.usersService.getSelectedTeamNextFixture(saveId);
  }

  @Post('saves/:saveId/selected-team/play-next-match')
  async playSelectedTeamNextMatch(
    @Param('saveId') saveId: string,
    @Body() body: PlaySelectedTeamMatchDto,
  ) {
    return this.usersService.playSelectedTeamNextMatch(
      saveId,
      body.homeGoals,
      body.awayGoals,
    );
  }
  
  @Post('saves/:saveId/simulate-current-round')
  async simulateRemainingFixturesInCurrentRound(
    @Param('saveId') saveId: string,
  ) {
    return this.usersService.simulateRemainingFixturesInCurrentRound(saveId);
  }
  
  @Post('saves/:saveId/complete-current-round')
  async completeCurrentRound(@Param('saveId') saveId: string) {
    return this.usersService.completeCurrentRound(saveId);
  }

  @Get('saves/:saveId/rounds')
  async getRoundsOverview(@Param('saveId') saveId: string) {
    return this.usersService.getRoundsOverview(saveId);
  }

  @Get('saves/:saveId/rounds/:roundNumber')
  async getRoundFixtures(
    @Param('saveId') saveId: string,
    @Param('roundNumber') roundNumber: string,
  ) {
    return this.usersService.getRoundFixtures(saveId, Number(roundNumber));
  }

  @Get('saves/:saveId/teams/:teamId')
  async getTeamDetail(
    @Param('saveId') saveId: string,
    @Param('teamId') teamId: string,
  ) {
    return this.usersService.getTeamDetail(saveId, teamId);
  }

  @Get('saves/:saveId/teams/:teamId/players')
  async getTeamPlayers(
    @Param('saveId') saveId: string,
    @Param('teamId') teamId: string,
  ) {
    return this.usersService.getTeamPlayers(saveId, teamId);
  }

  @Get('saves/:saveId/teams/:teamId/fixtures')
  async getTeamFixtures(
    @Param('saveId') saveId: string,
    @Param('teamId') teamId: string,
  ) {
    return this.usersService.getTeamFixtures(saveId, teamId);
  }

  @Get('saves/:saveId/leagues')
  async getSaveLeagues(@Param('saveId') saveId: string) {
    return this.usersService.getSaveLeagues(saveId);
  }

  @Get('saves/:saveId/leagues/:leagueId')
  async getLeagueDetail(
    @Param('saveId') saveId: string,
    @Param('leagueId') leagueId: string,
  ) {
    return this.usersService.getLeagueDetail(saveId, leagueId);
  }

  @Get('saves/:saveId/leagues/:leagueId/teams')
  async getLeagueTeams(
    @Param('saveId') saveId: string,
    @Param('leagueId') leagueId: string,
  ) {
    return this.usersService.getLeagueTeams(saveId, leagueId);
  }

  @Get('saves/:saveId/selected-team/next-match-context')
  async getSelectedTeamNextMatchContext(@Param('saveId') saveId: string) {
    return this.usersService.getSelectedTeamNextMatchContext(saveId);
  }

  @Patch('saves/:saveId/players/:playerId/role')
  async updatePlayerRole(
    @Param('saveId') saveId: string,
    @Param('playerId') playerId: string,
    @Body() body: UpdatePlayerRoleDto,
  ) {
    return this.usersService.updatePlayerRole(saveId, playerId, body.role);
  }
  
  @Patch('saves/:saveId/players/:playerId/lineup-position')
  async updatePlayerLineupPosition(
    @Param('saveId') saveId: string,
    @Param('playerId') playerId: string,
    @Body() body: UpdatePlayerLineupPositionDto,
  ) {
    return this.usersService.updatePlayerLineupPosition(
      saveId,
      playerId,
      body.lineupPosition ?? null,
    );
  }
  
  @Patch('saves/:saveId/players/:playerId/transfer-list-status')
  async updatePlayerTransferListStatus(
    @Param('saveId') saveId: string,
    @Param('playerId') playerId: string,
    @Body() body: UpdatePlayerTransferListStatusDto,
  ) {
    return this.usersService.updatePlayerTransferListStatus(
      saveId,
      playerId,
      body.isTransferListed,
    );
  }

  @Post('saves/:saveId/transfer-listed-players/:playerId/buy')
  async buyTransferListedPlayer(
    @Param('saveId') saveId: string,
    @Param('playerId') playerId: string,
  ) {
    return this.usersService.buyTransferListedPlayer(saveId, playerId);
  }

  @Get('saves/:saveId/screens/squad')
  async getSquadScreen(@Param('saveId') saveId: string) {
    return this.usersService.getSquadScreen(saveId);
  }

  @Get('saves/:saveId/screens/transfer')
  async getTransferScreen(@Param('saveId') saveId: string) {
    return this.usersService.getTransferScreen(saveId);
  }

  @Get('saves/:saveId/screens/fixtures')
  async getFixturesScreen(@Param('saveId') saveId: string) {
    return this.usersService.getFixturesScreen(saveId);
  }

  @Get('saves/:saveId/screens/standings')
  async getStandingsScreen(@Param('saveId') saveId: string) {
    return this.usersService.getStandingsScreen(saveId);
  }

  @Post('auth/login')
  async login(@Body() body: LoginDto) {
    return this.savesService.login(body.email, body.password);
  }

  @Get(':userId/profile')
  async getUserProfile(@Param('userId') userId: string) {
    return this.savesService.getUserProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/me')
  async getMe(@Request() req: { user: { id: string; email: string; username: string } }) {
    return this.savesService.getAuthenticatedUserProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/saves')
  async createMySave(
    @Request() req: { user: { id: string; email: string; username: string } },
    @Body() body: CreateGameSaveDto,
  ) {
    return this.savesService.createGameSave(
      req.user.id,
      body.name,
      body.selectedTeamShortName,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/saves')
  async getMySaves(
    @Request() req: { user: { id: string; email: string; username: string } },
  ) {
    return this.savesService.listUserSaves(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/saves/:saveId/resume-summary')
  async getMySaveResumeSummary(
    @Request() req: { user: { id: string; email: string; username: string } },
    @Param('saveId') saveId: string,
  ) {
    return this.usersService.getSaveResumeSummary(req.user.id, saveId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/saves/:saveId/rename')
  async renameMySave(
    @Request() req: { user: { id: string; email: string; username: string } },
    @Param('saveId') saveId: string,
    @Body() body: RenameSaveDto,
  ) {
    return this.savesService.renameSave(req.user.id, saveId, body.name);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/saves/:saveId')
  async deleteMySave(
    @Request() req: { user: { id: string; email: string; username: string } },
    @Param('saveId') saveId: string,
  ) {
    return this.savesService.deleteSave(req.user.id, saveId);
  }

  @Post(':userId/saves')
  async createGameSave(
    @Param('userId') userId: string,
    @Body() body: CreateGameSaveDto,
  ) {
    return this.savesService.createGameSave(
      userId,
      body.name,
      body.selectedTeamShortName,
    );
  }

  @Get(':userId/saves')
  async listUserSaves(@Param('userId') userId: string) {
    return this.savesService.listUserSaves(userId);
  }

  @Get(':userId/saves/:saveId/resume-summary')
  async getSaveResumeSummary(
    @Param('userId') userId: string,
    @Param('saveId') saveId: string,
  ) {
    return this.usersService.getSaveResumeSummary(userId, saveId);
  }

  @Patch(':userId/saves/:saveId/rename')
  async renameSave(
    @Param('userId') userId: string,
    @Param('saveId') saveId: string,
    @Body() body: RenameSaveDto,
  ) {
    return this.savesService.renameSave(userId, saveId, body.name);
  }

  @Delete(':userId/saves/:saveId')
  async deleteSave(
    @Param('userId') userId: string,
    @Param('saveId') saveId: string,
  ) {
    return this.savesService.deleteSave(userId, saveId);
  }
}