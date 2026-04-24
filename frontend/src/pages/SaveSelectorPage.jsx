import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useGameStore } from "../store/gameStore";
import { useSaveStore } from "../store/saveStore";

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

  const handleCreate = async (e) => {
    e.preventDefault();
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
        <div className="top-row">
          <div>
            <h1>Mentések</h1>
            <p className="muted-text">
              Bejelentkezve:{" "}
              <strong>{user?.username || user?.email || "Felhasználó"}</strong>
            </p>
          </div>

          <button onClick={handleLogout} className="secondary-btn">
            Kilépés
          </button>
        </div>

        {saveError && <p className="error-text">{saveError}</p>}

        <div className="two-col">
          <section className="card">
            <h2>Új mentés</h2>

            <form onSubmit={handleCreate} className="form-stack">
              <input
                type="text"
                placeholder="Mentés neve"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />

              <select
                value={createForm.selectedTeamShortName}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    selectedTeamShortName: e.target.value,
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

              <button type="submit" disabled={isCreatingSave}>
                {isCreatingSave ? "Létrehozás..." : "Új mentés indítása"}
              </button>
            </form>
          </section>

          <section className="card">
            <h2>Meglévő mentések</h2>

            {isInitialLoading ? (
              <p>Betöltés...</p>
            ) : saves.length === 0 ? (
              <p>Még nincs mentésed.</p>
            ) : (
              <div className="save-list">
                {saves.map((save) => (
                  <div key={save.id} className="save-card">
                    <div>
                      <h3>{save.name}</h3>

                      <p>
                        Csapat:{" "}
                        <strong>{save.selectedTeam?.name || "Nincs"}</strong>
                      </p>

                      <p>Forduló: {save.currentRound}</p>

                      <p>
                        Haladás: {save.progress?.playedFixtures ?? 0}/
                        {save.progress?.totalFixtures ?? 0}
                      </p>

                      <p>
                        Állapot:{" "}
                        {save.isFinished ? "Befejezett" : "Folyamatban"}
                      </p>
                    </div>

                    <div className="save-actions">
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
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}