import { apiClient } from './api-client';

export async function fetchSportsTeams() {
  const { data } = await apiClient('/sports/teams');
  return data;
}

export async function fetchTournaments() {
  const { data } = await apiClient('/sports/tournaments');
  return data;
}

export async function fetchActivities() {
  const { data } = await apiClient('/sports/activities');
  return data;
}

export async function createTeam(teamData: any) {
  const { data } = await apiClient('/sports/teams', {
    method: 'POST',
    body: JSON.stringify(teamData),
  });
  return data;
}

export async function createTournament(tournamentData: any) {
  const { data } = await apiClient('/sports/tournaments', {
    method: 'POST',
    body: JSON.stringify(tournamentData),
  });
  return data;
}
