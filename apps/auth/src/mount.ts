import { createReactRemote } from "@blog/contract/react";
import { App } from "./App";

/** The only export the shell consumes (`auth/mount`). */
export const mount = createReactRemote(App);
