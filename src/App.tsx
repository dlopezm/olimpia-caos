import React from 'react';
import { Tabs, TabList, TabPanel, Tab } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { MatchPlanner } from './MatchPlanner';
import { HistoricalMatches } from './HistoricalMatches';
import './App.css'; // Import your custom styles

export const App = () => {
  return (
    <div className="app-container">
      <Tabs className="tabs-container">
        <TabList>
          <Tab>Match Organizer</Tab>
          <Tab>Historical Matches</Tab>
        </TabList>

        <TabPanel>
          <MatchPlanner />
        </TabPanel>

        <TabPanel>
          <HistoricalMatches />
        </TabPanel>
      </Tabs>
    </div>
  );
};
