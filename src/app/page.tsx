'use client';

import { AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useLanguage } from '@/contexts/LanguageContext';
import sources from '@/data/sources.yaml';
import { Icons } from '@/components/icons';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Image from 'next/image';

interface Format {
  id: string;
  en: string;
  ar: string;
}

interface Topic {
  id: string;
  en: string;
  ar: string;
}

export default function Home() {
  const { language, setLanguage, dir } = useLanguage();
  const [formatFilters, setFormatFilters] = useState<string[]>([]);
  const [topicFilters, setTopicFilters] = useState<string[]>([]);

  // Updated: Get unique formats and topics using object keys to ensure uniqueness
  const uniqueFormats: Format[] = Array.from(
    new Set(sources.flatMap((source: { formats?: Format[] }) => source.formats?.map((format: Format) => format.id) || []))
  ).map((formatId: string) => {
    const format = sources.flatMap((s: { formats?: Format[] }) => s.formats || []).find((f: Format) => f.id === formatId);
    return format!;
  });

  const uniqueTopics: Topic[] = Array.from(
    new Set(sources.flatMap(source => source.topics?.map(topic => topic.id) || []))
  ).map(topicId => {
    const topic = sources.flatMap(s => s.topics || []).find(t => t.id === topicId);
    return topic!;
  });

  const filteredSources = sources.filter((source: { formats?: Format[]; topics?: Topic[] }) => {
    const formatMatch = formatFilters.length === 0 || 
      source.formats?.some((format: Format) => formatFilters.includes(format.id)) || false;
    const topicMatch = topicFilters.length === 0 || 
      source.topics?.some((topic: Topic) => topicFilters.includes(topic.id)) || false;
    return formatMatch && topicMatch;
  });

  return (
    <div dir={dir} className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <div className="flex items-center gap-2 mb-4 sm:mb-0">
          <Image 
            src="/flag.svg" 
            alt="Syrian Flag" 
            width={32} 
            height={24} 
            className="inline-block"
          />
          <h1 className="text-3xl font-bold">
            {language === 'en' ? 'Syria Data Guide' : 'دليل البيانات السورية'}
          </h1>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                {language === 'en' ? 'About' : 'حول'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {language === 'en' ? 'About' : 'حول'}
                </DialogTitle>
                <DialogDescription>
                  {language === 'en' 
                    ? 'Syria Data Guide is a comprehensive directory of data sources about Syria, including demographic, geographic, and statistical data, and reports published by institutes and think tanks.'
                    : 'دليل شامل لمصادر البيانات حول سوريا، بما في ذلك البيانات الديموغرافية والجغرافية والإحصائية والتقارير الصادرة عن المراكز البحثية.'
                  }
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Button 
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="w-full sm:w-auto"
          >
            {language === 'en' ? 'العربية' : 'English'}
          </Button>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <h2 className="text-sm font-medium mb-2">
            {language === 'en' ? 'Data Format' : 'الصيغة'}
          </h2>
          <ToggleGroup
            type="multiple"
            value={formatFilters}
            onValueChange={setFormatFilters}
            className={`flex flex-wrap gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}
          >
            {uniqueFormats.map((format: Format) => (
              <ToggleGroupItem
                key={format.id}
                value={format.id}
                className="rounded-full"
                aria-label={format[language]}
              >
                {format[language]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div>
          <h2 className="text-sm font-medium mb-2">
            {language === 'en' ? 'Topics' : 'المواضيع'}
          </h2>
          <ToggleGroup
            type="multiple"
            value={topicFilters}
            onValueChange={setTopicFilters}
            className={`flex flex-wrap gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}
          >
            {uniqueTopics.map((topic: Topic) => (
              <ToggleGroupItem
                key={topic.id}
                value={topic.id}
                className="rounded-full"
                aria-label={topic[language]}
              >
                {topic[language]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSources.map((source, index) => (
          <a href={source.url} target="_blank" rel="noopener noreferrer" key={index} className="h-full">
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader className="h-full flex flex-col">
                <div className="flex items-center gap-2">
                  <CardTitle>{source.title[language]}</CardTitle>
                </div>
                <CardDescription className="flex-grow">
                  {source.description[language]}
                </CardDescription>
                <div className="mt-2 flex flex-wrap gap-1">
                  {source.formats?.map((format: Format) => (
                    <span key={format.id} className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs">
                      {format[language]}
                    </span>
                  ))}
                  {source.topics?.map((topic: Topic) => (
                    <span key={topic.id} className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs">
                      {topic[language]}
                    </span>
                  ))}
                </div>
              </CardHeader>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}