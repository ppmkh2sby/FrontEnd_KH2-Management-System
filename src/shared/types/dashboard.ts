export type DashboardMetric = {
  label: string;
  value: number;
  hint: string;
};

export type SectionCardItem = {
  label: string;
  meta: string;
};

export type SectionCardProps = {
  title: string;
  description: string;
  badge: string;
  items: SectionCardItem[];
};
