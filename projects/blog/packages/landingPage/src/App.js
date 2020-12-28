import React from "react";
import { Switch, Route, Router } from "react-router-dom";
import {
  StylesProvider,
  createGenerateClassName,
} from "@material-ui/core/styles";

import Landing from "./components/05-Pages/Landing";
import Pricing from "./components/05-Pages/Pricing";
import About from "./components/05-Pages/About";

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
            <Route exact path="/About" component={About} />
            <Route exact path="/pricing" component={Pricing} />
            <Route path="/" component={Landing} />
          </Switch>
        </Router>
      </StylesProvider>
    </div>
  );
};
