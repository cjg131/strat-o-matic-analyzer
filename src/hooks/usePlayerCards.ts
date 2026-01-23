import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PlayerCard } from '../types/playerCard';

export function usePlayerCards() {
  const [playerCards, setPlayerCards] = useState<PlayerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'playerCards'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const cards = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          uploadedAt: doc.data().uploadedAt?.toDate() || new Date(),
        })) as PlayerCard[];
        setPlayerCards(cards);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching player cards:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const uploadPlayerCard = async (
    file: File,
    playerName: string,
    playerType: 'hitter' | 'pitcher',
    extractedStats?: any,
    playerId?: string
  ): Promise<string> => {
    try {
      // Convert image to base64 and store directly in Firestore
      const reader = new FileReader();
      const imageUrl = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Create Firestore document with extracted stats
      const cardData: Omit<PlayerCard, 'id'> = {
        playerId: playerId || '',
        playerName,
        playerType,
        imageUrl,
        uploadedAt: new Date(),
        // Add extracted stats if available
        ...(extractedStats?.balance && { 
          hitting: {
            ...extractedStats.hitting
          }
        }),
        ...(extractedStats?.pitching && {
          pitching: extractedStats.pitching
        }),
        ...(extractedStats?.defense && {
          defense: { positions: extractedStats.defense }
        }),
        ...(extractedStats?.stealRating && {
          running: {
            stealRating: extractedStats.stealRating,
            runRating: extractedStats.runRating || '',
            bunting: extractedStats.bunting,
            hitAndRun: extractedStats.hitAndRun
          }
        })
      };

      const docRef = await addDoc(collection(db, 'playerCards'), cardData);
      return docRef.id;
    } catch (err: any) {
      console.error('Error uploading player card:', err);
      throw new Error(err.message);
    }
  };

  const updatePlayerCard = async (cardId: string, updates: Partial<PlayerCard>) => {
    try {
      const cardRef = doc(db, 'playerCards', cardId);
      await updateDoc(cardRef, updates);
    } catch (err: any) {
      console.error('Error updating player card:', err);
      throw new Error(err.message);
    }
  };

  const deletePlayerCard = async (cardId: string) => {
    try {
      // Delete Firestore document (image is stored as base64 in the document)
      await deleteDoc(doc(db, 'playerCards', cardId));
    } catch (err: any) {
      console.error('Error deleting player card:', err);
      throw new Error(err.message);
    }
  };

  const getPlayerCard = (playerName: string): PlayerCard | undefined => {
    return playerCards.find(card => 
      card.playerName.toLowerCase() === playerName.toLowerCase()
    );
  };

  const getPlayerCardsByType = (type: 'hitter' | 'pitcher'): PlayerCard[] => {
    return playerCards.filter(card => card.playerType === type);
  };

  return {
    playerCards,
    loading,
    error,
    uploadPlayerCard,
    updatePlayerCard,
    deletePlayerCard,
    getPlayerCard,
    getPlayerCardsByType,
  };
}
