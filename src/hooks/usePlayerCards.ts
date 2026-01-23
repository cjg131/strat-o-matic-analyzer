import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
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
    playerId?: string
  ): Promise<string> => {
    try {
      // Upload image to Firebase Storage
      const timestamp = Date.now();
      const fileName = `player-cards/${playerType}/${playerName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);

      // Create Firestore document
      const cardData: Omit<PlayerCard, 'id'> = {
        playerId: playerId || '',
        playerName,
        playerType,
        imageUrl,
        uploadedAt: new Date(),
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
      const card = playerCards.find(c => c.id === cardId);
      if (!card) throw new Error('Card not found');

      // Delete image from storage
      const imageRef = ref(storage, card.imageUrl);
      await deleteObject(imageRef);

      // Delete Firestore document
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
