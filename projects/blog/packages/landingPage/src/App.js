import React from "react";
import { Switch, Route, Router } from "react-router-dom";
import {
  StylesProvider,
  createGenerateClassName,
} from "@material-ui/core/styles";

 // import Landing from "./components/05-Pages/LandingPage";
 // import PricingPage from "./components/05-Pages/PricingPage";
 // import AboutPage from "./components/05-Pages/AboutPage";
import { LandingPage, PricingPage, AboutPage } from './components/05-Pages';

const generateClassName = createGenerateClassName({
  productionPrefix: "ma",
});

/**
 * App component.
 * @param history
 * @returns {JSX.Element}
 */
export default ({ history }) => {
  return (
    <div>
      <StylesProvider generateClassName={generateClassName}>
        <Router history={history}>
          <Switch>
            <Route exact path="/about" component={AboutPage} />
            <Route exact path="/pricing" component={PricingPage} />
            <Route path="/" component={LandingPage} />
          </Switch>
        </Router>
      </StylesProvider>
    </div>
  );
};
