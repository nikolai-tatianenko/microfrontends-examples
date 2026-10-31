import { runStandalone } from "@blog/contract/standalone";
import { mount } from "./mount";

runStandalone(mount, "/dashboard");
