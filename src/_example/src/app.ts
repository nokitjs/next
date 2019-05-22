import { Application } from "../..";
import { resolve } from "path";

const { info, error } = console;

const application = new Application({
  root: resolve(__dirname, "../")
});
application
  .launch()
  .then(({ port }) => info("Running:", `http://localhost:${port}`))
  .catch(err => error(err));
