import React from 'react';
import type {
  CampaignDilemmaOption,
  CampaignMonthlyDilemma
} from '@argentina-sim/infrastructure';
import { NewspaperEventModal } from '../events-newspaper/NewspaperEventModal.js';

// Modal de Dilemas Emergentes de Campaña ("Situación del Mes") acoplado al formato
// tapa de diario argentino estilo HOI4, unificando campaña y gobierno.

interface CampaignMonthlyDilemmaModalProps {
  dilemma: CampaignMonthlyDilemma | null;
  onSelectOption: (option: CampaignDilemmaOption) => void;
}

export function CampaignMonthlyDilemmaModal({
  dilemma,
  onSelectOption
}: CampaignMonthlyDilemmaModalProps) {
  if (!dilemma) {
    return null;
  }

  const mappedOptions = dilemma.options.map((opt) => ({
    id: opt.id,
    title: opt.title,
    badges: opt.badges
  }));

  const handleChoose = (optionId: string) => {
    const chosen = dilemma.options.find((o) => o.id === optionId);
    if (chosen) {
      onSelectOption(chosen);
    }
  };

  return (
    <NewspaperEventModal
      eventId={dilemma.id}
      category="CAMPANA"
      dateLabel={dilemma.formattedDate}
      title={dilemma.title}
      description={dilemma.description}
      photoCaption={`CRÓNICA DE CAMPAÑA 2027 — ${dilemma.title.toUpperCase()}`}
      footerLeft="SITUACIÓN DEL MES · NO VUELVE A APARECER EN LA PARTIDA"
      footerRight={`EDICIÓN ELECTORAL · ID ${dilemma.id}`}
      ctaLabel="Elegir esta opción"
      options={mappedOptions}
      onChoose={handleChoose}
    />
  );
}
