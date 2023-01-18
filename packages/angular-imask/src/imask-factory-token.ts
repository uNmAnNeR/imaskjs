import { InjectionToken, inject } from "@angular/core";
import { DefaultImaskFactory } from "./default-imask-factory";

export const IMASK_FACTORY = new InjectionToken('IMASK_FACTORY', {providedIn: 'root', factory: () => inject(DefaultImaskFactory)})
