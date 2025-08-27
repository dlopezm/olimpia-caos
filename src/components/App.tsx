import { useEffect, useState } from "react";
import { Tabs, TabList, TabPanel, Tab } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { MatchPlanner } from "./match-planner/MatchPlanner";
import { PlayerList } from "./player-list/PlayerList";
import "./App.css";
import { HistoricalMatches } from "./historical-matches/HistoricalMatches";
import { DataProvider } from "../stores/DataStore";

const TAB_ANCHORS = ["equipador", "historial", "jugadors"];

const AppContent = () => {
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    const index = TAB_ANCHORS.indexOf(hash);
    if (index !== -1) setTabIndex(index);
  }, []);

  const handleTabSelect = (index: number) => {
    window.location.hash = TAB_ANCHORS[index];
    setTabIndex(index);
  };

  return (
    <div className="app-container">
      <Tabs
        className="tabs-container"
        selectedIndex={tabIndex}
        onSelect={handleTabSelect}
      >
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

export const App = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};
