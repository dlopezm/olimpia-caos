import { Routes, Route, Link, useLocation } from "react-router-dom";
import { MatchPlanner } from "./match-planner/MatchPlanner";
import { PlayerList } from "./player-list/PlayerList";
import { HistoricalMatches } from "./historical-matches/HistoricalMatches";
import { PlayerPage } from "./player-page/PlayerPage";
import { DataProvider } from "../stores/DataStore";
import "./App.css";

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="navigation">
      <Link 
        to="/" 
        className={`nav-link ${isActive("/") ? "active" : ""}`}
      >
        Creador d'equips
      </Link>
      <Link 
        to="/historial" 
        className={`nav-link ${isActive("/historial") ? "active" : ""}`}
      >
        Historial de partits
      </Link>
      <Link 
        to="/jugadors" 
        className={`nav-link ${isActive("/jugadors") ? "active" : ""}`}
      >
        Llista de jugadors
      </Link>
    </nav>
  );
};

const AppContent = () => {
  return (
    <div className="app-container">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<MatchPlanner />} />
          <Route path="/historial" element={<HistoricalMatches />} />
          <Route path="/jugadors" element={<PlayerList />} />
          <Route path="/jugador/:playerId" element={<PlayerPage />} />
        </Routes>
      </main>
    </div>
  );
};

export const App = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};
