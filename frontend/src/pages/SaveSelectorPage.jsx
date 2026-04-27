import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHero from "../components/PageHero";
import EmptyState from "../components/EmptyState";
import InlineLoader from "../components/InlineLoader";
import { useAuthStore } from "../store/authStore";
import { useGameStore } from "../store/gameStore";
import { useSaveStore } from "../store/saveStore";

const getProgressPercent = (save) => {
  const played = save.progress?.playedFixtures ?? 0;
  const total = save.progress?.totalFixtures ?? 0;

  if (!total) return 0;

  return Math.round((played / total) * 100);
};

export default function SaveSelectorPage() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const setActiveSave = useGameStore((state) => state.setActiveSave);
  const clearActiveSave = useGameStore((state) => state.clearActiveSave);

  const saves = useSaveStore((state) => state.saves);
  const teams = useSaveStore((state) => state.teams);
  const isLoadingSaves = useSaveStore((state) => state.isLoadingSaves);
  const isLoadingTeams = useSaveStore((state) => state.isLoadingTeams);
  const isCreatingSave = useSaveStore((state) => state.isCreatingSave);
  const isDeletingSave = useSaveStore((state) => state.isDeletingSave);
  const saveError = useSaveStore((state) => state.saveError);

  const clearSaveError = useSaveStore((state) => state.clearSaveError);
  const loadSaveSelectorData = useSaveStore(
    (state) => state.loadSaveSelectorData
  );
  const createSave = useSaveStore((state) => state.createSave);
  const deleteSave = useSaveStore((state) => state.deleteSave);

  const [createForm, setCreateForm] = useState({
    name: "",
    selectedTeamShortName: "",
  });

  useEffect(() => {
    loadSaveSelectorData().catch(() => {});
  }, [loadSaveSelectorData]);

  const handleContinue = async (saveId) => {
    clearSaveError();

    try {
      await setActiveSave(saveId);
      navigate("/dashboard");
    } catch {}
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    clearSaveError();

    if (!createForm.name.trim()) return;
    if (!createForm.selectedTeamShortName) return;

    try {
      const response = await createSave(createForm);
      await setActiveSave(response.gameSave.id);
      navigate("/dashboard");
    } catch {}
  };

  const handleDelete = async (saveId) => {
    const confirmed = window.confirm("Biztosan törölni szeretnéd ezt a mentést?");
    if (!confirmed) return;

    try {
      await deleteSave(saveId);
    } catch {}
  };

  const handleLogout = () => {
    clearActiveSave();
    logout();
    navigate("/login");
  };

  const isInitialLoading = isLoadingSaves || isLoadingTeams;

  return (
    <div className="page-shell">
      <div className="page-container">
        <PageHero
          kicker="Career Select"
          title="Mentések"
          subtitle={`Bejelentkezve: ${user?.username || user?.email || "Felhasználó"}`}
        >
          <button className="secondary-btn" onClick={handleLogout}>
            Kilépés
          </button>
        </PageHero>

        {saveError && <p className="error-text">{saveError}</p>}

        <div className="save-selector-layout">
          <section className="card create-save-card">
            <span className="game-page-kicker">New Career</span>
            <h2>Új mentés</h2>

            <form onSubmit={handleCreate} className="form-stack">
              <label>
                Mentés neve
                <input
                  type="text"
                  placeholder="pl. Barcelona karrier"
                  value={createForm.name}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                Csapat
                <select
                  value={createForm.selectedTeamShortName}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      selectedTeamShortName: event.target.value,
                    }))
                  }
                >
                  <option value="">Válassz csapatot</option>

                  {teams.map((team) => (
                    <option key={team.id} value={team.shortName}>
                      {team.name} ({team.shortName})
                    </option>
                  ))}
                </select>
              </label>

              <button type="submit" disabled={isCreatingSave}>
                {isCreatingSave ? "Létrehozás..." : "Karrier indítása"}
              </button>
            </form>
          </section>

          <section className="card">
            <div className="section-heading-row">
              <div>
                <span className="game-page-kicker">Saved Careers</span>
                <h2>Meglévő mentések</h2>
              </div>
            </div>

            {isInitialLoading ? (
              <InlineLoader text="Mentések betöltése..." />
            ) : saves.length === 0 ? (
              <EmptyState
                title="Még nincs mentésed."
                description="Indíts új karriert egy csapat kiválasztásával."
              />
            ) : (
              <div className="career-save-grid">
                {saves.map((save) => {
                  const progressPercent = getProgressPercent(save);

                  return (
                    <div key={save.id} className="career-save-card">
                      <div className="career-save-header">
                        <div>
                          <strong>{save.name}</strong>
                          <p className="muted-text">
                            {save.selectedTeam?.name || "Nincs csapat"}
                          </p>
                        </div>

                        <span
                          className={`career-status-badge ${
                            save.isFinished
                              ? "career-status-finished"
                              : "career-status-active"
                          }`}
                        >
                          {save.isFinished ? "Befejezett" : "Folyamatban"}
                        </span>
                      </div>

                      <div className="career-save-meta">
                        <span>Forduló: {save.currentRound}</span>
                        <span>
                          {save.progress?.playedFixtures ?? 0}/
                          {save.progress?.totalFixtures ?? 0} meccs
                        </span>
                      </div>

                      <div className="career-progress-bar">
                        <div style={{ width: `${progressPercent}%` }} />
                      </div>

                      <div className="career-save-actions">
                        <button onClick={() => handleContinue(save.id)}>
                          Folytatás
                        </button>

                        <button
                          onClick={() => handleDelete(save.id)}
                          className="danger-btn"
                          disabled={isDeletingSave}
                        >
                          {isDeletingSave ? "Törlés..." : "Törlés"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}