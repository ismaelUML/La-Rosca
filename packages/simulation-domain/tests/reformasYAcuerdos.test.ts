import { describe, expect, it } from 'vitest';
import {
  INITIAL_FIXED_REFORMS,
  toggleFixedReformState,
  checkIsBillIdeologicallyAligned,
  executeFederalAgreement,
  OFFICIAL_LAWS_QQG,
  FEDERAL_AGREEMENTS_CATALOG
} from '../src/index.js';

describe('Reformas Institucionales EA y Acuerdos Federales Parity', () => {
  it('toggleFixedReformState alterna vigencia y desactiva reformas mutuamente excluyentes', () => {
    const { updatedReforms } = toggleFixedReformState(INITIAL_FIXED_REFORMS, 'sin_paso');
    const sinPaso = updatedReforms.find((r) => r.id === 'sin_paso');
    const conPaso = updatedReforms.find((r) => r.id === 'con_paso');

    expect(sinPaso?.active).toBe(true);
    expect(conPaso?.active).toBe(false);
  });

  it('checkIsBillIdeologicallyAligned valida alineación según partido gobernante', () => {
    const desregulacionLaboral = OFFICIAL_LAWS_QQG.find((l) => l.ideology === 'LIBERAL')!;
    const estatista = OFFICIAL_LAWS_QQG.find((l) => l.ideology === 'ESTATISTA')!;

    expect(checkIsBillIdeologicallyAligned(desregulacionLaboral.ideology, 'LLA')).toBe(true);
    expect(checkIsBillIdeologicallyAligned(desregulacionLaboral.ideology, 'UxP')).toBe(false);

    expect(checkIsBillIdeologicallyAligned(estatista.ideology, 'UxP')).toBe(true);
    expect(checkIsBillIdeologicallyAligned(estatista.ideology, 'LLA')).toBe(false);
  });

  it('executeFederalAgreement ejecuta pacto federal descontando fondos y otorgando lealtad', () => {
    const acuerdo = FEDERAL_AGREEMENTS_CATALOG[0]!;
    const res = executeFederalAgreement(acuerdo, 50, 200);

    expect(res.success).toBe(true);
    expect(res.newArgentums).toBe(175);
    expect(res.newLoyalty).toBe(65);
  });
});
