export type ÉtatServeur = ÉtatServeurActif | ÉtatServeurFermé;

export type ÉtatServeurActif = {
  état: 'actif';
  détails: {
    port: number;
    codeSecret: string;
  }
};

export type ÉtatServeurFermé = {
  état: 'fermé'
}