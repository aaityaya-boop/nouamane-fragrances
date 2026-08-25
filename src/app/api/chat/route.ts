import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const rawKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    console.log("API KEY AVAILABLE:", !!rawKey);
    console.log("API KEY TYPE:", typeof rawKey);
    console.log("API KEY LENGTH:", rawKey ? rawKey.length : 0);
    console.log("API KEY START:", rawKey ? rawKey.substring(0, 5) : 'none');
    
    const google = createGoogleGenerativeAI({
      apiKey: rawKey ? rawKey.replace(/['"]/g, '').trim() : undefined,
    });
    
    const { messages } = await req.json();

    // Fetch the product catalog to feed into the AI's context
    const products = await prisma.product.findMany({
      where: { published: true },
      select: {
        name: true,
        slug: true,
        brandLabel: true,
        price: true,
        tagline: true,
        description: true,
        notes: true,
        gender: true,
        subcategoryLabel: true,
      },
    });

    const catalogContext = products.map((p) => {
      let notesStr = '';
      try {
        const notesObj = typeof p.notes === 'string' ? JSON.parse(p.notes) : p.notes;
        notesStr = `Notes: Tête (${notesObj?.top?.join(', ') || ''}), Coeur (${notesObj?.heart?.join(', ') || ''}), Fond (${notesObj?.base?.join(', ') || ''})`;
      } catch (e) {
        notesStr = String(p.notes || '');
      }
      return `[${p.name}](/fr/product/${p.slug}) par ${p.brandLabel} (${p.subcategoryLabel}, ${p.gender}). Prix: ${p.price}Dh. ${p.tagline}. ${notesStr}`;
    }).join('\n');

    const systemPrompt = `Tu es "Conseiller NAY", l'expert parfumeur virtuel et raffiné de la boutique marocaine NAY Parfums.
Ton objectif est de conseiller les clients avec élégance, politesse, et un ton luxueux (vouvoiement de rigueur).
Tu réponds de manière concise, chaleureuse et très structurée.

Voici le catalogue actuel des parfums disponibles sur la boutique :
${catalogContext}

Instructions importantes pour la mise en forme :
1. Ne recommande QUE les parfums présents dans la liste ci-dessus.
2. Lorsque tu recommandes un produit, tu DOIS TOUJOURS le présenter avec une belle mise en forme Markdown en incluant son lien, comme ceci :
   **[Nom du Parfum](/fr/product/le-slug)**
   *Par Marque* - Prix : 99 Dh
   Un petit descriptif ou explication...
3. N'invente jamais de lien. Le lien exact est fourni entre crochets et parenthèses dans le catalogue ci-dessus. Utilise exactement ce lien relatif (ex: /fr/product/le-slug).
4. Si un client cherche un type de parfum spécifique, analyse les notes olfactives et propose 2 ou 3 choix pertinents avec la présentation décrite.
5. Si on te pose une question hors du domaine de la parfumerie ou du service client NAY Parfums, recadre poliment la conversation sur les parfums.`;

    const result = await streamText({
      model: google('gemini-3.6-flash') as any,
      system: systemPrompt,
      messages,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Erreur API Chat:', error);
    return NextResponse.json({ error: 'Une erreur est survenue.' }, { status: 500 });
  }
}
