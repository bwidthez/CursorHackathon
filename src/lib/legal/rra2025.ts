/**
 * Structured knowledge for Renters' Rights Act 2025 (RRA 2025).
 * Used to ground AI responses and provide citations.
 * Legislation applies from 1 May 2026.
 */

export interface LegalSection {
  id: string;
  title: string;
  summary: string;
  citation: string;
}

export const RRA_SECTIONS: LegalSection[] = [
  {
    id: "no-fault",
    title: "Abolition of no-fault evictions",
    summary: "Landlords cannot evict without a valid reason (ground). Section 21 'no-fault' evictions are abolished under the new system.",
    citation: "Renters' Rights Act 2025; Housing Act 1988 (as amended)",
  },
  {
    id: "court-order",
    title: "Eviction only with a court order",
    summary: "A landlord cannot force you to leave without a court order. You do not have to leave until the court has ordered possession and the bailiffs attend.",
    citation: "Renters' Rights Act 2025; Protection from Eviction Act 1977",
  },
  {
    id: "notice-periods",
    title: "Notice periods",
    summary: "Landlords must give correct written notice. Notice periods depend on the ground (e.g. rent arrears, breach of tenancy). Short notice without a valid ground is not lawful.",
    citation: "Renters' Rights Act 2025; prescribed notice periods",
  },
  {
    id: "section8",
    title: "Section 8 grounds for possession",
    summary: "Possession can only be sought on specified grounds (e.g. rent arrears, anti-social behaviour, landlord needs property). Each ground has its own notice period and evidence requirements.",
    citation: "Renters' Rights Act 2025; Housing Act 1988 Sch.2 (as amended)",
  },
  {
    id: "disrepair",
    title: "Landlord repair obligations",
    summary: "Landlords must keep the property in good repair (structure, exterior, installations). Serious hazards can be enforced by the local authority. You must not withhold rent; use the council or court route instead.",
    citation: "Landlord and Tenant Act 1985; Housing Health and Safety Rating System; West Northamptonshire Council enforcement",
  },
  {
    id: "illegal-eviction",
    title: "Illegal eviction and harassment",
    summary: "Harassment and illegal eviction are criminal offences. Report to the local authority (West Northamptonshire Council) and consider contacting the police if you are in immediate danger.",
    citation: "Protection from Eviction Act 1977; Renters' Rights Act 2025",
  },
];

export const DISCLAIMER =
  "This is general information only, not legal advice. For your specific situation, consider contacting a housing adviser (e.g. Shelter, Citizens Advice) or a solicitor.";

export function getRelevantSections(issueType: string): LegalSection[] {
  const lower = issueType.toLowerCase();
  if (lower.includes("evict") || lower.includes("leave") || lower.includes("notice")) {
    return RRA_SECTIONS.filter(
      (s) =>
        s.id === "no-fault" ||
        s.id === "court-order" ||
        s.id === "notice-periods" ||
        s.id === "section8" ||
        s.id === "illegal-eviction"
    );
  }
  if (lower.includes("repair") || lower.includes("damp") || lower.includes("disrepair")) {
    return RRA_SECTIONS.filter((s) => s.id === "disrepair" || s.id === "illegal-eviction");
  }
  return RRA_SECTIONS;
}
