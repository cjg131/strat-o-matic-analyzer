import { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Trash2, Eye, Clipboard } from 'lucide-react';
import { usePlayerCards } from '../hooks/usePlayerCards';
import { useHitters } from '../hooks/useHitters';
import { usePitchers } from '../hooks/usePitchers';

export function PlayerCardsPage() {
  const { playerCards, loading, uploadPlayerCard, deletePlayerCard } = usePlayerCards();
  const { hitters } = useHitters();
  const { pitchers } = usePitchers();
  
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [playerType, setPlayerType] = useState<'hitter' | 'pitcher'>('hitter');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'hitter' | 'pitcher'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [detectedName, setDetectedName] = useState<string>('');

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            await processImage(blob);
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const processImage = async (file: File | Blob) => {
    const imageFile = file instanceof File ? file : new File([file], 'pasted-image.png', { type: 'image/png' });
    setSelectedFile(imageFile);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setPreviewUrl(dataUrl);
      await detectPlayerName(dataUrl);
    };
    reader.readAsDataURL(imageFile);
  };

  const detectPlayerName = async (imageUrl: string) => {
    setDetecting(true);
    try {
      const Tesseract = (await import('tesseract.js')).default;
      
      const img = new Image();
      img.src = imageUrl;
      await new Promise((resolve) => { img.onload = resolve; });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const topHeight = Math.min(150, img.height * 0.15);
      canvas.width = img.width;
      canvas.height = topHeight;
      
      ctx.drawImage(img, 0, 0, img.width, topHeight, 0, 0, img.width, topHeight);
      
      const croppedImageUrl = canvas.toDataURL();
      
      const { data: { text } } = await Tesseract.recognize(croppedImageUrl, 'eng', {
        logger: () => {}
      });

      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      let detectedPlayerName = '';
      let detectedYear = '';
      
      for (const line of lines) {
        const nameYearMatch = line.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*\((\d{4})\)/i);
        if (nameYearMatch) {
          detectedPlayerName = nameYearMatch[1].trim();
          detectedYear = nameYearMatch[2];
          break;
        }
        
        const nameOnlyMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
        if (nameOnlyMatch && nameOnlyMatch[1].length > 5 && !detectedPlayerName) {
          detectedPlayerName = nameOnlyMatch[1].trim();
        }
      }

      if (detectedPlayerName) {
        const displayName = detectedYear ? `${detectedPlayerName} (${detectedYear})` : detectedPlayerName;
        setDetectedName(displayName);
        
        // Search in hitters first
        const hitterNames = hitters.map(h => h.name);
        const matchedHitter = findBestMatch(detectedPlayerName, hitterNames);
        
        if (matchedHitter) {
          setPlayerType('hitter');
          // Use setTimeout to ensure state update completes
          setTimeout(() => setSelectedPlayer(matchedHitter), 0);
        } else {
          // Search in pitchers
          const pitcherNames = pitchers.map(p => p.name);
          const matchedPitcher = findBestMatch(detectedPlayerName, pitcherNames);
          
          if (matchedPitcher) {
            setPlayerType('pitcher');
            setTimeout(() => setSelectedPlayer(matchedPitcher), 0);
          }
        }
      }
    } catch (error) {
      console.error('OCR error:', error);
    } finally {
      setDetecting(false);
    }
  };

  const findBestMatch = (detected: string, players: string[]): string | null => {
    const detectedLower = detected.toLowerCase();
    const detectedParts = detectedLower.split(/\s+/);
    
    // Extract last name (usually first word for "FirstName LastName" format)
    const detectedLastName = detectedParts[detectedParts.length - 1];
    const detectedFirstName = detectedParts[0];
    const detectedFirstInitial = detectedFirstName ? detectedFirstName[0] : '';
    
    for (const player of players) {
      const playerLower = player.toLowerCase();
      
      // Check for "LastName, F." format matching "FirstName LastName"
      if (playerLower.includes(detectedLastName)) {
        // Check if first initial matches
        if (detectedFirstInitial && playerLower.includes(detectedFirstInitial + '.')) {
          return player;
        }
        // Or if full first name is in the player string
        if (detectedFirstName && playerLower.includes(detectedFirstName)) {
          return player;
        }
      }
      
      // Fallback: check if last name is prominent in both
      const playerParts = playerLower.split(/[,\s]+/);
      if (playerParts[0] === detectedLastName || playerParts.some(part => part === detectedLastName)) {
        return player;
      }
    }
    
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select or paste an image');
      return;
    }

    setUploading(true);
    try {
      const playerName = selectedPlayer || detectedName || 'Unknown Player';
      await uploadPlayerCard(selectedFile, playerName, playerType);
      setSelectedFile(null);
      setSelectedPlayer('');
      setPreviewUrl(null);
      setDetectedName('');
      alert('Player card uploaded successfully!');
    } catch (error: any) {
      alert(`Error uploading: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this player card?')) return;
    
    try {
      await deletePlayerCard(cardId);
      alert('Player card deleted successfully!');
    } catch (error: any) {
      alert(`Error deleting: ${error.message}`);
    }
  };

  const allPlayers = playerType === 'hitter' 
    ? hitters.map(h => h.name)
    : pitchers.map(p => p.name);

  const filteredCards = playerCards
    .filter(card => filterType === 'all' || card.playerType === filterType)
    .filter(card => card.playerName.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading player cards...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Player Cards
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload and manage player card images with advanced stats
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Player Card</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side - Upload form */}
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clipboard className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Paste from clipboard
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Take a screenshot and press Cmd+V (Mac) or Ctrl+V (Windows) to paste it here. The player name will be automatically detected.
                  </p>
                  {detecting && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                      🔍 Detecting player name...
                    </p>
                  )}
                  {detectedName && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                      ✓ Detected: {detectedName}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Player Type
              </label>
              <select
                value={playerType}
                onChange={(e) => {
                  setPlayerType(e.target.value as 'hitter' | 'pitcher');
                  setSelectedPlayer('');
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="hitter">Hitter</option>
                <option value="pitcher">Pitcher</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Player Name (Optional) {detectedName && <span className="text-green-600 dark:text-green-400 text-xs">(auto-detected)</span>}
              </label>
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">-- Optional: Select player to link card --</option>
                {allPlayers.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                You can upload now and link to a player later
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Player Card Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload Player Card'}
            </button>
          </div>

          {/* Right side - Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preview
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 h-64 flex items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="text-center text-gray-400">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                  <p>No image selected</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cards Gallery */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Player Card Gallery</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Players</option>
              <option value="hitter">Hitters</option>
              <option value="pitcher">Pitchers</option>
            </select>
          </div>
        </div>

        {filteredCards.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No player cards uploaded yet</p>
            <p className="text-sm">Upload your first player card above to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCards.map(card => (
              <div key={card.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-900 relative group">
                  <img 
                    src={card.imageUrl} 
                    alt={card.playerName}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => window.open(card.imageUrl, '_blank')}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      title="View full size"
                    >
                      <Eye className="h-5 w-5 text-gray-900" />
                    </button>
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                      title="Delete card"
                    >
                      <Trash2 className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {card.playerName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {card.playerType}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
