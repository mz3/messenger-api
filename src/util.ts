// This point of abstraction creates modularity for helper functions.
// Individual implementations can added or replaced with npm libraries or custom code,
// without needing to refactor the code that depends on them. Unit tests standardize
// functionality, Typescript documents the API, and a README.md would be created to
// demonstrate usage. Development teams can use utility functions as a starting point
// for learning functional programming paradigms, and building a library

// Custom implementations should have unit tests
export const isInteger = (x: any): x is number => Number.isInteger(x);
export const isEmpty = (x: any) => x?.length === 0;

// Utility functions can be borrowed from libraries such as ramda, underscore, lodash.
export { keys } from "ramda";

// Functions can be extended and composed
import * as R from "ramda";

export const isString = R.is(String);
