'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getStyleRecommendations, type StyleAdvisorInput, type StyleAdvisorOutput } from '@/ai/flows/style-advisor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, Wand2, AlertTriangle, CheckCircle2, Loader2, UploadCloud } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const StyleAdvisorFormSchema = z.object({
  occasion: z.string().min(3, 'Occasion should be at least 3 characters').optional().or(z.literal('')),
  preferences: z.string().min(5, 'Preferences should be at least 5 characters').optional().or(z.literal('')),
  outfitPhoto: z.custom<FileList>().optional()
    .refine(files => !files || files.length === 0 || (files?.[0]?.size ?? 0) <= 5 * 1024 * 1024, `Max file size is 5MB.`)
    .refine(files => !files || files.length === 0 || ['image/jpeg', 'image/png', 'image/webp'].includes(files?.[0]?.type ?? ''), 'Only .jpg, .png, .webp formats are supported.')
});

type StyleAdvisorFormValues = z.infer<typeof StyleAdvisorFormSchema>;

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function StyleAdvisorPage() {
  const [recommendations, setRecommendations] = useState<StyleAdvisorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<StyleAdvisorFormValues>({
    resolver: zodResolver(StyleAdvisorFormSchema),
  });
  const outfitPhotoFile = watch("outfitPhoto");

  const onSubmit: SubmitHandler<StyleAdvisorFormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const input: StyleAdvisorInput = {
        occasion: data.occasion,
        preferences: data.preferences,
      };

      if (data.outfitPhoto && data.outfitPhoto.length > 0) {
        input.photoDataUri = await fileToDataUri(data.outfitPhoto[0]);
      }

      const result = await getStyleRecommendations(input);
      setRecommendations(result);
      toast({
        title: "Style Advice Ready!",
        description: "We've generated new recommendations for you.",
        variant: "default",
        action: <CheckCircle2 className="text-green-500" />,
      });
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get recommendations: ${errorMessage}`);
      toast({
        title: "Error",
        description: `Failed to get recommendations: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <Wand2 className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-4xl font-headline">AI Style Advisor</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Let our AI help you choose the perfect accessories! Describe your occasion, preferences, or upload an outfit photo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="occasion" className="text-lg font-medium">Occasion (Optional)</Label>
              <Input id="occasion" {...register('occasion')} placeholder="e.g., Beach party, Formal dinner" className="mt-1 bg-background" />
              {errors.occasion && <p className="text-sm text-destructive mt-1">{errors.occasion.message}</p>}
            </div>

            <div>
              <Label htmlFor="preferences" className="text-lg font-medium">Your Preferences (Optional)</Label>
              <Textarea id="preferences" {...register('preferences')} placeholder="e.g., I love silver, prefer minimalist designs, allergic to nickel" rows={4} className="mt-1 bg-background" />
              {errors.preferences && <p className="text-sm text-destructive mt-1">{errors.preferences.message}</p>}
            </div>

            <div>
              <Label htmlFor="outfitPhoto" className="text-lg font-medium">Outfit Photo (Optional)</Label>
              <div className="mt-1 flex items-center justify-center w-full">
                  <label htmlFor="outfitPhoto" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="mb-1 text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (MAX. 5MB)</p>
                           {fileName && <p className="text-xs text-accent mt-1">{fileName}</p>}
                      </div>
                      <Input id="outfitPhoto" type="file" {...register('outfitPhoto', { onChange: handleFileChange })} className="hidden" accept=".png,.jpg,.jpeg,.webp" />
                  </label>
              </div>
              {errors.outfitPhoto && <p className="text-sm text-destructive mt-1">{errors.outfitPhoto.message}</p>}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full text-lg py-3 bg-accent hover:bg-accent/90">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Getting Advice...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" /> Get Style Advice
                </>
              )}
            </Button>
          </form>

          {error && (
             <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {recommendations && !isLoading && (
            <Card className="mt-8 bg-card border-primary">
              <CardHeader>
                <CardTitle className="text-2xl font-headline text-primary flex items-center">
                  <CheckCircle2 className="mr-2 h-7 w-7 text-green-500" /> Your Style Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg text-primary mb-2">Recommended Accessories:</h4>
                  {recommendations.recommendations.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 pl-2 text-foreground">
                      {recommendations.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No specific accessory recommendations, try adjusting your input!</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-primary mb-2">Reasoning:</h4>
                  <p className="text-foreground whitespace-pre-wrap">{recommendations.reasoning}</p>
                </div>
                 <Button variant="outline" onClick={() => { setRecommendations(null); reset(); setFileName(null); }} className="mt-4 text-primary border-primary hover:bg-primary hover:text-primary-foreground">
                    Start Over
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
