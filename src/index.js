import * as React from "react";
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { DataProvider } from "./context/DataContext";
import { WaitingListProvider } from './context/WaitingListContext';
import { ActivityProvider } from "./context/ActivityContext";
import { App } from "./components/App/App";
import './styles/index.css';
const root = createRoot(document.getElementById("content-area"));
root.render(<DataProvider>
        <WaitingListProvider>
            <ActivityProvider>
                <HashRouter>
                    <App />
                </HashRouter>
            </ActivityProvider>
        </WaitingListProvider>
    </DataProvider>);