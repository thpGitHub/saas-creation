import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialiser OpenAI avec ta clé API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Types pour les options de configuration
interface PreviewRequestBody {
  title: string;
  content: string;
  model?: string;
  maxTokens?: number;
}

// Liste des modèles disponibles
const AVAILABLE_MODELS: Record<string, string> = {
  "gpt-3.5-turbo": "GPT-3.5 Turbo",
  "gpt-4": "GPT-4",
  "gpt-4-turbo": "GPT-4 Turbo"
};

// Modèles qui supportent le formatage JSON
const SUPPORTS_JSON_FORMAT = ["gpt-3.5-turbo"];

// Modèle et tokens par défaut
const DEFAULT_MODEL = "gpt-3.5-turbo";
const DEFAULT_MAX_TOKENS = 500;

export async function POST(request: Request) {
  try {
    const body: PreviewRequestBody = await request.json();
    console.log('📝 Contenu reçu:', body);
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Clé API OpenAI non configurée');
    }

    // Utiliser le modèle spécifié ou le modèle par défaut
    const model = body.model && AVAILABLE_MODELS[body.model] ? body.model : DEFAULT_MODEL;
    
    // Utiliser maxTokens spécifié ou la valeur par défaut
    const maxTokens = body.maxTokens || DEFAULT_MAX_TOKENS;

    console.log(`🤖 Utilisation du modèle: ${model}, max tokens: ${maxTokens}`);

    // Configuration de base
    const requestConfig: any = {
      model: model,
      max_tokens: maxTokens,
      messages: [
        {
          role: "system",
          content: "Tu es un expert en rédaction LinkedIn. Tu dois optimiser les posts pour maximiser l'engagement tout en gardant un ton professionnel. Tu DOIS répondre uniquement avec un objet JSON contenant 'title' et 'content'."
        },
        {
          role: "user",
          content: `Rédige un post LinkedIn professionnel en français basé sur les informations suivantes :
- Titre : ${body.title}
- Contenu : ${body.content}
Assure-toi que le ton est professionnel, engageant et adapté à une audience LinkedIn.${SUPPORTS_JSON_FORMAT.includes(model) ? '' : '\nFormate ta réponse sous forme d\'objet JSON avec les propriétés "title" et "content".'}`
        }
      ]
    };

    // Ajouter le format de réponse JSON uniquement pour les modèles qui le supportent
    if (SUPPORTS_JSON_FORMAT.includes(model)) {
      requestConfig.response_format = { type: "json_object" };
    }

    // Appeler OpenAI directement
    const completion = await openai.chat.completions.create(requestConfig);

    // Extraire la réponse
    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Réponse OpenAI vide');
    }

    let result;
    try {
      // Tenter de parser le JSON
      result = JSON.parse(content);
    } catch (parseError) {
      console.error('⚠️ Erreur de parsing JSON:', parseError);
      // Si le parsing échoue, extraire manuellement title et content avec des regex
      const titleMatch = content.match(/["']title["']\s*:\s*["'](.+?)["']/);
      const contentMatch = content.match(/["']content["']\s*:\s*["'](.+?)["']/);
      
      if (titleMatch && contentMatch) {
        result = {
          title: titleMatch[1],
          content: contentMatch[1]
        };
      } else {
        // Fallback: renvoyer le contenu brut
        result = {
          title: body.title,
          content: content
        };
      }
    }
    
    console.log('✅ Contenu optimisé:', result);

    return NextResponse.json({
      ...result,
      _meta: {
        model: model,
        maxTokens: maxTokens,
        usage: completion.usage
      }
    });
  } catch (error) {
    console.error('💥 Erreur:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
} 