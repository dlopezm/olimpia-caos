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
          <Tab>Creador d'equips</Tab>
          <Tab>Historial de partits</Tab>
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
