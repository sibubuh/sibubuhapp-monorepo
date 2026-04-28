export interface TimelineItem {
  year: string;
  month: string;
  title: string;
  body: string;
  accent: string;
  tag: string;
  tagBg: string;
  tagColor: string;
}

export interface TimelineSection {
  __component: "components.sections.timelines";
  id: number;
  title?: string;
  items: TimelineItem[];
}