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
  occasion: z.string().min(3, 'A ocasião deve ter pelo menos 3 caracteres').optional().or(z.literal('')),
  preferences: z.string().min(5, 'As preferências devem ter pelo menos 5 caracteres').optional().or(z.literal('')),
  outfitPhoto: z.custom<FileList>().optional()
    .refine(files => !files || files.length === 0 || (files?.[0]?.size ?? 0) <= 5 * 1024 * 1024, `O tamanho máximo do arquivo é 5MB.`)
    .refine(files => !files || files.length === 0 || ['image/jpeg', 'image/png', 'image/webp'].includes(files?.[0]?.type ?? ''), 'Apenas formatos .jpg, .png, .webp são suportados.')
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
        title: "Dicas de Estilo Prontas!",
        description: "Geramos novas recomendações para você.",
        variant: "default",
        action: <CheckCircle2 className="text-green-500" />,
      });
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
      setError(`Falha ao obter recomendações: ${errorMessage}`);
      toast({
        title: "Erro",
        description: `Falha ao obter recomendações: ${errorMessage}`,
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
      <Card className="shadow-xl bg-card">
        <CardHeader className="text-center">
          <Wand2 className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-4xl font-headline text-primary">Consultor de Estilo AI</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Deixe nossa IA ajudar você a escolher os acessórios perfeitos! Descreva sua ocasião, preferências ou envie uma foto do seu look.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="occasion" className="text-lg font-medium">Ocasião (Opcional)</Label>
              <Input id="occasion" {...register('occasion')} placeholder="Ex: Festa na praia, Jantar formal" className="mt-1 bg-input" />
              {errors.occasion && <p className="text-sm text-destructive mt-1">{errors.occasion.message}</p>}
            </div>

            <div>
              <Label htmlFor="preferences" className="text-lg font-medium">Suas Preferências (Opcional)</Label>
              <Textarea id="preferences" {...register('preferences')} placeholder="Ex: Amo prata, prefiro designs minimalistas, alergia a níquel" rows={4} className="mt-1 bg-input" />
              {errors.preferences && <p className="text-sm text-destructive mt-1">{errors.preferences.message}</p>}
            </div>

            <div>
              <Label htmlFor="outfitPhoto" className="text-lg font-medium">Foto do Look (Opcional)</Label>
              <div className="mt-1 flex items-center justify-center w-full">
                  <label htmlFor="outfitPhoto" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="mb-1 text-sm text-muted-foreground">
                            <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                          </p>
                          <p className="text-xs text-muted-foreground">PNG, JPG ou WEBP (MÁX. 5MB)</p>
                           {fileName && <p className="text-xs text-accent mt-1">{fileName}</p>}
                      </div>
                      <Input id="outfitPhoto" type="file" {...register('outfitPhoto', { onChange: handleFileChange })} className="hidden" accept=".png,.jpg,.jpeg,.webp" />
                  </label>
              </div>
              {errors.outfitPhoto && <p className="text-sm text-destructive mt-1">{errors.outfitPhoto.message}</p>}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full text-lg py-3 bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Obtendo Aconselhamento...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" /> Obter Dicas de Estilo
                </>
              )}
            </Button>
          </form>

          {error && (
             <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {recommendations && !isLoading && (
            <Card className="mt-8 bg-input border-primary">
              <CardHeader>
                <CardTitle className="text-2xl font-headline text-primary flex items-center">
                  <CheckCircle2 className="mr-2 h-7 w-7 text-green-500" /> Suas Recomendações de Estilo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg text-foreground mb-2">Acessórios Recomendados:</h4>
                  {recommendations.recommendations.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 pl-2 text-foreground">
                      {recommendations.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Nenhuma recomendação específica de acessório, tente ajustar sua entrada!</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-foreground mb-2">Justificativa:</h4>
                  <p className="text-foreground whitespace-pre-wrap">{recommendations.reasoning}</p>
                </div>
                 <Button variant="outline" onClick={() => { setRecommendations(null); reset(); setFileName(null); }} className="mt-4 text-primary border-primary hover:bg-primary hover:text-primary-foreground">
                    Começar de Novo
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
