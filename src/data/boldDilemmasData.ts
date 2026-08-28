import { BoldDilemma } from '../types';
import { AQEEDAH_PHILOSOPHY_DILEMMAS } from './dilemmas/aqeedahPhilosophy';
import { TECH_MODERNITY_DILEMMAS } from './dilemmas/techModernity';
import { BIOETHICS_MEDICINE_DILEMMAS } from './dilemmas/bioethicsMedicine';
import { ECONOMY_FINANCE_DILEMMAS } from './dilemmas/economyFinance';
import { ETHICS_SOCIETY_DILEMMAS } from './dilemmas/ethicsSociety';
import { PSYCHOLOGY_FIQH_LIFE_DILEMMAS } from './dilemmas/psychologyFiqhLife';

export const BOLD_DILEMMAS: BoldDilemma[] = [
  ...AQEEDAH_PHILOSOPHY_DILEMMAS,
  ...TECH_MODERNITY_DILEMMAS,
  ...BIOETHICS_MEDICINE_DILEMMAS,
  ...ECONOMY_FINANCE_DILEMMAS,
  ...ETHICS_SOCIETY_DILEMMAS,
  ...PSYCHOLOGY_FIQH_LIFE_DILEMMAS,
];

export {
  AQEEDAH_PHILOSOPHY_DILEMMAS,
  TECH_MODERNITY_DILEMMAS,
  BIOETHICS_MEDICINE_DILEMMAS,
  ECONOMY_FINANCE_DILEMMAS,
  ETHICS_SOCIETY_DILEMMAS,
  PSYCHOLOGY_FIQH_LIFE_DILEMMAS,
};

