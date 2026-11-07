import './quiz.css';
import {PersonalityQuiz} from '@/components/PersonalityQuiz';
import {validHippo,archetypes} from '@/lib/quiz';
import {hippos} from '@/lib/catalog';
export async function generateMetadata({searchParams}:{searchParams:Promise<{result?:string}>}){const id=validHippo((await searchParams).result),h=hippos.find(h=>h.id===id),a=archetypes.find(a=>a.id===id);return {title:h?h.name+' · '+a!.title:'Find your hippo energy',description:'Twelve interactive prompts, five vibe dimensions and seven famous hippo matches. A playful personality quiz with detailed results and a downloadable card.'};}
export default function Page({searchParams}:{searchParams:{result?:string}}){return <PersonalityQuiz sharedHippoId={validHippo(searchParams.result)}/>;}
