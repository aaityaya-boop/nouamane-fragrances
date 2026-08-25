import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  try {
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
        notesStr = p.notes;
      }
      return `- ${p.name} par ${p.brandLabel} (${p.subcategoryLabel}, ${p.gender}). Prix: ${p.price}Dh. ${p.tagline}. ${notesStr}`;
    }).join('\n');

    const systemPrompt = `Tu es "Conseiller NAY", l'expert parfumeur virtuel et raffiné de la boutique marocaine NAY Parfums.
Ton objectif est de conseiller les clients avec élégance, politesse, et un ton luxueux (vouvoiement de rigueur).
Tu réponds toujours de manière concise et chaleureuse. 

Voici le catalogue actuel des parfums disponibles sur la boutique :
${catalogContext}

Instructions importantes :
1. Ne recommande QUE les parfums présents dans la liste ci-dessus.
2. Si un client cherche un type de parfum spécifique (ex: boisé, sucré, vanille, oud), cherche dans les notes olfactives des parfums de la liste et recommande-lui les meilleurs choix.
3. Donne toujours le prix en Dirham marocain (Dh).
4. Invite subtilement le client à utiliser la barre de recherche ou à naviguer dans les catégories du site pour trouver le produit s'il est intéressé.
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
