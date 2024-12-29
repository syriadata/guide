'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/contexts/LanguageContext';
// import sources from '@/data/sources.json';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Image from 'next/image';

import { getSources } from '@/lib/data';

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

interface Source {
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  url: string;
  logo?: string;
  formats?: Format[];
  topics?: Topic[];
}

export const dynamic = 'force-static';




export default  function Home() {
  const sources = getSources();
  const { language, setLanguage, dir } = useLanguage();
  const [formatFilters, setFormatFilters] = useState<string[]>([]);
  const [topicFilters, setTopicFilters] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log('Submitting form...');
    
    // Store form reference
    const form = e.target as HTMLFormElement;
    
    const formData = new FormData(form);
    
    const formats = selectedFormats.map(format => 
      format === 'other' ? formData.get('otherFormat') : format
    ).filter(Boolean);
    
    const topics = selectedTopics.map(topic => 
      topic === 'other' ? formData.get('otherTopic') : topic
    ).filter(Boolean);
  
    const data = {
      email: formData.get('email'),
      url: formData.get('url'),
      formats,
      topics,
      description: formData.get('description')
    };
    
    try {
      console.log('Sending request with data:', data);
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit');
      }
  
      console.log('Submission successful');
      
      // Reset all states
      setIsSuccess(true);
      setSelectedFormats([]);
      setSelectedTopics([]);
      setShowOtherFormat(false);
      setShowOtherTopic(false);
      
      // Safely reset the form
      try {
        form.reset();
        console.log('Form reset successful');
      } catch (resetError) {
        console.error('Error resetting form:', resetError);
      }
      
    } catch (error) {
      console.error('Error:', error);
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleDialogClose = () => {
    setDialogOpen(false);
    // Only reset the success state after the dialog is closed
    setTimeout(() => {
      setIsSuccess(false);
    }, 300); // Wait for dialog close animation
  };

  const SuccessMessage = () => (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <div className="rounded-full bg-green-100 p-3">
        <svg 
          className="h-6 w-6 text-green-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-green-600">
        {language === 'en' ? 'Thank you for your submission!' : 'شكراً على مساهمتك!'}
      </h3>
      <p className="text-center text-muted-foreground">
        {language === 'en' 
          ? 'Your data source has been submitted successfully. We\'ll review it and email you once it\'s posted.' 
          : 'تم إرسال مصدر البيانات بنجاح. سنقوم بمراجعة طلبك وارسال إيميل عندما يتم نشره.'}
      </p>
      <Button 
        onClick={handleDialogClose}
        className="mt-4"
      >
        {language === 'en' ? 'Close' : 'إغلاق'}
      </Button>
    </div>
  );
  
  
  const [showOtherFormat, setShowOtherFormat] = useState(false);
  const [showOtherTopic, setShowOtherTopic] = useState(false);

  // Update the useEffect to watch for "other" selections
  useEffect(() => {
    setShowOtherFormat(selectedFormats.includes('other'));
  }, [selectedFormats]);

  useEffect(() => {
    setShowOtherTopic(selectedTopics.includes('other'));
  }, [selectedTopics]);


  // Updated: Get unique formats and topics using object keys to ensure uniqueness
  const uniqueFormats: Format[] = Array.from(
    new Set(sources.flatMap((source: Source) => source.formats?.map(format => format.id) || []))
  ).map((formatId: unknown) => {
    const format = sources.flatMap((s: Source) => s.formats || []).find((f: Format) => f.id === formatId as string);
    return format!;
  });

  const uniqueTopics: Topic[] = Array.from(
    new Set(sources.flatMap((source: Source) => source.topics?.map(topic => topic.id) || []))
  ).map((topicId: unknown) => {
    const topic = sources.flatMap((s: Source) => s.topics || []).find((t: Topic) => t.id === topicId as string);
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
        <div className="flex items-center gap-2 mb-4 sm:mb-0 justify-center sm:justify-start">
          <Image 
            src="/flag.svg" 
            alt="Syrian Flag" 
            width={32} 
            height={24} 
            className="inline-block"
          />
          <h1 className="text-3xl font-bold text-primary">
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
            <DialogContent 
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              className={`sm:max-w-[425px] ${language === 'ar' ? '[&>button]:left-4 [&>button]:right-auto' : ''}`}
            >
              <DialogHeader>
                <DialogTitle className={`font-ibm-plex-sans-arabic ${language === 'ar' ? 'text-right' : ''}`}>
                  {language === 'en' ? 'About' : 'حول'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                {language === 'en' 
                  ? <>
                      <DialogDescription>
                      A comprehensive guide providing data sources, statistics, and research reports on various topics related to Syrian affairs to assist decision-makers and researchers.
                      </DialogDescription>
                      <DialogDescription>
                        This is an open source project. You can view the source code and contribute on <a href="https://github.com/hamzakat/syria-data-guide" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">GitHub</a>.
                      </DialogDescription>
                    </>
                  : <>
                      <DialogDescription className="font-ibm-plex-sans-arabic">
                        دليل شامل يوفر مصادر بيانات وإحصائيات وتقارير البحثية حول مواضيع المتنوعة متعلقة بالشأن السوري لمساعدة صناع القرار والباحثين.
                      </DialogDescription>
                      <DialogDescription className="font-ibm-plex-sans-arabic">
                        هذا مشروع مفتوح المصدر. يمكنك عرض الكود المصدري والمساهمة على <a href="https://github.com/hamzakat/syria-data-guide" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">GitHub</a>.
                      </DialogDescription>
                    </>
                }
              </div>
            </DialogContent>
          </Dialog>
          <Button 
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="w-full sm:w-auto"
          >
            {language === "ar" ? "English" : <span className="font-ibm-plex-sans-arabic">العربية</span>}
          </Button>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <h2 className="text-sm font-medium mb-2">
            {language === 'en' ? 'Format' : 'الصيغة'}
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
            {language === 'en' ? 'Topic' : 'الموضوع'}
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
        {filteredSources.map((source: Source, index: number) => (
          <a href={source.url} target="_blank" rel="noopener noreferrer" key={index} className="h-full">
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader className="h-full flex flex-col">
                <div className="flex items-center gap-2">
                  {source.logo && (
                    <Image 
                      src={source.logo} 
                      alt={`${source.title[language]} logo`} 
                      width={80} 
                      height={80} 
                      className="rounded"
                    />
                  )}
                  <CardTitle className="text-primary">{source.title[language]}</CardTitle>
                </div>
                <CardDescription className="flex-grow text-primary">
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <a className="h-full cursor-pointer" onClick={() => setDialogOpen(true)}>
                <Card className="hover:shadow-lg transition-shadow h-full flex items-center justify-center">
                  <CardHeader className="text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="rounded-full bg-muted p-4">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <CardTitle className="text-lg">
                        {language === 'en' ? 'Propose a Source' : 'اقترح مصدراً'}
                      </CardTitle>
                    </div>
                  </CardHeader>
                </Card>
              </a>
            </DialogTrigger>
            <DialogContent 
              className={`sm:max-w-[500px] dialog-content-scroll ${language === 'ar' ? '[&>button]:left-4 [&>button]:right-auto' : ''}`}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              <DialogHeader>
                <DialogTitle className={language === 'ar' ? 'font-ibm-plex-sans-arabic text-right' : ''}>
                  {language === 'en' ? 'Propose a New Data Source' : 'اقترح مصدر بيانات جديد'}
                </DialogTitle>
                <DialogDescription className={language === 'ar' ? 'font-ibm-plex-sans-arabic text-right' : ''}>
                  {language === 'en' 
                    ? 'Fill in the details about the data source you would like to propose.'
                    : 'املأ تفاصيل مصدر البيانات الذي تريد اقتراحه.'}
                </DialogDescription>
              </DialogHeader>
              
                {isSuccess ? (
                  <SuccessMessage />
                ) : (
                  
                  <form 
                    className={`space-y-4 ${language === 'ar' ? 'font-ibm-plex-sans-arabic text-right' : ''}`} 
                    onSubmit={handleSubmit}
                  >
                    <div className="space-y-2">
                      <label className={`text-sm font-medium ${language === 'ar' ? 'font-ibm-plex-sans-arabic' : ''}`}>
                        {language === 'en' ? 'Email (optional, for contacting you)' : 'البريد الإلكتروني (اختياري، للتواصل معك)'}
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="w-full rounded-md border p-2"
                        placeholder={language === 'en' ? 'your@email.com' : 'بريدك@الإلكتروني.com'}
                      />
                    </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === 'en' ? 'Link (e.g. add a Google Drive link in case you want to shre a dataset)' : 'الرابط (مثلاً: رابط غوغل درايف لملفات البيانات)'}
                    </label>
                    <input
                      type="url"
                      name="url"
                      required
                      className="w-full rounded-md border p-2"
                      placeholder={language === 'en' ? 'https://...' : 'https://...'}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === 'en' ? 'Format' : 'الصيغة'}
                    </label>
                    <ToggleGroup
                      type="multiple"
                      value={selectedFormats}
                      onValueChange={setSelectedFormats}
                      className={`flex flex-wrap gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                    >
                      <ToggleGroupItem value="geospatial" className="rounded-full">
                        {language === 'en' ? 'Geospatial' : 'بيانات جغرافية'}
                      </ToggleGroupItem>
                      <ToggleGroupItem value="stats" className="rounded-full">
                        {language === 'en' ? 'Statistics & Indicators' : 'احصائيات ومؤشرات'}
                      </ToggleGroupItem>
                      <ToggleGroupItem value="reports" className="rounded-full">
                        {language === 'en' ? 'Reports' : 'تقارير'}
                      </ToggleGroupItem>
                      <ToggleGroupItem value="visualizations" className="rounded-full">
                        {language === 'en' ? 'Visualizations' : 'تصورات بيانية'}
                      </ToggleGroupItem>
                      <ToggleGroupItem value="raw" className="rounded-full">
                        {language === 'en' ? 'Raw' : 'بيانات خام'}
                      </ToggleGroupItem>
                      <ToggleGroupItem value="other" className="rounded-full">
                        {language === 'en' ? 'Other' : 'أخرى'}
                      </ToggleGroupItem>
                    </ToggleGroup>
                    {showOtherFormat && (
                      <input
                        type="text"
                        name="otherFormat"
                        className="w-full rounded-md border p-2 mt-2"
                        placeholder={language === 'en' ? 'Please specify format...' : 'يرجى تحديد الصيغة...'}
                        required
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === 'en' ? 'Topic' : 'الموضوع'}
                    </label>
                    <ToggleGroup
                      type="multiple"
                      value={selectedTopics}
                      onValueChange={setSelectedTopics}
                      className={`flex flex-wrap gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                    >
                      <ToggleGroupItem value="population" className="rounded-full">
                        {language === 'en' ? 'Population' : 'سكان'}
                      </ToggleGroupItem>
                      <ToggleGroupItem value="society" className="rounded-full">
                        {language === 'en' ? 'Society' : 'المجتمع'}
                      </ToggleGroupItem>
                      <ToggleGroupItem value="economy" className="rounded-full">
                        {language === 'en' ? 'Economy' : 'اقتصاد'}
                      </ToggleGroupItem>
                      <ToggleGroupItem value="humanitarian" className="rounded-full">
                        {language === 'en' ? 'Humanitarian' : 'إنسانية'}
                      </ToggleGroupItem>
                      <ToggleGroupItem value="osint" className="rounded-full">
                        {language === 'en' ? 'Open-Source Investigations' : 'تحقيقات مفتوحة المصدر'}
                      </ToggleGroupItem>
                      <ToggleGroupItem value="conflicts" className="rounded-full">
                        {language === 'en' ? 'Conflicts' : 'النزاعات'}
                      </ToggleGroupItem>
                      <ToggleGroupItem value="archive" className="rounded-full">
                        {language === 'en' ? 'Archive' : 'أرشيف'}
                      </ToggleGroupItem>
                      <ToggleGroupItem value="policy" className="rounded-full">
                        {language === 'en' ? 'Policy Analysis' : 'تحليل السياسات'}
                      </ToggleGroupItem>
                      <ToggleGroupItem value="migration" className="rounded-full">
                        {language === 'en' ? 'Migration & Displacement' : 'الهجرة والنزوح'}
                      </ToggleGroupItem>
                      <ToggleGroupItem value="environment" className="rounded-full">
                        {language === 'en' ? 'Environment' : 'البيئة'}
                      </ToggleGroupItem>
                      <ToggleGroupItem value="other" className="rounded-full">
                        {language === 'en' ? 'Other' : 'أخرى'}
                      </ToggleGroupItem>
                    </ToggleGroup>
                    {showOtherTopic && (
                      <input
                        type="text"
                        name="otherTopic"
                        className="w-full rounded-md border p-2 mt-2"
                        placeholder={language === 'en' ? 'Please specify topic...' : 'يرجى تحديد الموضوع...'}
                        required
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === 'en' ? 'Description (optional)' : 'الوصف (اختياري)'}
                    </label>
                    <textarea
                      name="description"
                      className="w-full rounded-md border p-2 min-h-[100px]"
                      rows={4}
                      placeholder={language === 'en' ? 'Brief description of the data source...' : 'وصف موجز لمصدر البيانات...'}
                    />
                  </div>
                  <div className={`flex gap-2 ${language === 'ar' ? 'justify-start' : 'justify-end'}`}>
                    <DialogClose asChild>
                      <Button variant="outline" disabled={isSubmitting}>
                        {language === 'en' ? 'Cancel' : 'إلغاء'}
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          {language === 'en' ? 'Submitting...' : 'جاري الإرسال...'}
                        </div>
                      ) : (
                        language === 'en' ? 'Submit' : 'إرسال'
                      )}
                    </Button>
                  </div>
                </form>
                
              )}
            
          </DialogContent>
          </Dialog>

      </div>
      
    
      <div className="flex justify-center mt-6">
        <a href="https://github.com/hamzakat/syria-data-guide" target="_blank" rel="noopener noreferrer" className="flex items-center">
          <Image 
            src="/github.svg"
            alt="GitHub Repository" 
            width={30} 
            height={30} 
            className="inline-block"
          />
        </a>
      </div>
    </div>
  );
}