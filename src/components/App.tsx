import { Tabs, TabList, TabPanel, Tab } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { MatchPlanner } from "./match-planner/MatchPlanner";
import { PlayerList } from "./player-list/PlayerList"; // ⬅️ Import the new component
import "./App.css";
import { HistoricalMatches } from "./historical-matches/HistoricalMatches";

export const App = () => {
  return (
    <div className="app-container">
      <Tabs className="tabs-container">
        <TabList>
          <Tab>Creador d'equips</Tab>
          <Tab>Historial de partits</Tab>
          <Tab>Llista de jugadors</Tab>
        </TabList>

        <TabPanel>
          <MatchPlanner />
        </TabPanel>

        <TabPanel>
          <HistoricalMatches />
        </TabPanel>

        <TabPanel>
          <PlayerList />
        </TabPanel>
      </Tabs>
    </div>
  );
};
