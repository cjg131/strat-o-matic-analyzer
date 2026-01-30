import { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2, Clipboard } from 'lucide-react';
import { useHitters } from '../hooks/useHitters';
import { usePitchers } from '../hooks/usePitchers';
import { useAuth } from '../contexts/AuthContext';
import { processRosterImages, convertToRosterAssignments, type RosterData } from '../utils/rosterOCR';
import { assignRosterToPlayer } from '../utils/rosterAssignment';
import { saveRosterAssignments } from '../services/firestore';

interface RosterImage {
  id: string;
  file: File | null;
  preview: string | null;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  extractedData?: RosterData;
}

export function RosterManagementPage() {
  const { hitters, updateHitter } = useHitters();
  const { pitchers, updatePitcher } = usePitchers();
  const { currentUser } = useAuth();
  const [rosterImages, setRosterImages] = useState<RosterImage[]>([
    { id: 'roster1', file: null, preview: null, status: 'pending' },
    { id: 'roster2', file: null, preview: null, status: 'pending' },
    { id: 'roster3', file: null, preview: null, status: 'pending' },
  ]);
  const [processing, setProcessing] = useState(false);

  // Handle clipboard paste for images
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            // Find first empty slot
            const emptyIndex = rosterImages.findIndex(r => r.file === null);
            if (emptyIndex !== -1) {
              const file = new File([blob], `roster-${emptyIndex + 1}.png`, { type: 'image/png' });
              handleImageUpload(emptyIndex, file);
            }
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [rosterImages]);

  const handleImageUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setRosterImages(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          file,
          preview: reader.result as string,
          status: 'pending'
        };
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index: number) => {
    setRosterImages(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        file: null,
        preview: null,
        status: 'pending',
        error: undefined,
        extractedData: undefined
      };
      return updated;
    });
  };

  const processRosterImagesHandler = async () => {
    setProcessing(true);
    
    // Collect files to process
    const filesToProcess = rosterImages
      .filter(r => r.file !== null)
      .map(r => r.file!);
    
    if (filesToProcess.length === 0) {
      setProcessing(false);
      return;
    }

    try {
      // Process all images with OCR
      const results = await processRosterImages(filesToProcess);
      
      // Update state with results
      let resultIndex = 0;
      setRosterImages(prev => {
        const updated = [...prev];
        for (let i = 0; i < updated.length; i++) {
          if (updated[i].file && resultIndex < results.length) {
            updated[i] = {
              ...updated[i],
              status: 'success',
              extractedData: results[resultIndex]
            };
            resultIndex++;
          }
        }
        return updated;
      });

      // Generate roster assignments
      const assignments = convertToRosterAssignments(results);
      
      // Download roster-assignments.json
      downloadRosterAssignments(assignments);
      
      // Auto-sync rosters to database if user is logged in
      if (currentUser) {
        await syncRostersToDatabase(assignments);
      }

    } catch (error) {
      // Mark all processing images as error
      setRosterImages(prev => {
        const updated = [...prev];
        for (let i = 0; i < updated.length; i++) {
          if (updated[i].file && updated[i].status === 'processing') {
            updated[i] = {
              ...updated[i],
              status: 'error',
              error: error instanceof Error ? error.message : 'Failed to process image'
            };
          }
        }
        return updated;
      });
    }

    setProcessing(false);
  };

  const downloadRosterAssignments = (assignments: Record<string, any>) => {
    const blob = new Blob([JSON.stringify(assignments, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roster-assignments.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const syncRostersToDatabase = async (assignments: Record<string, any>) => {
    try {
      console.log('🔄 Starting roster sync to database...');
      console.log('Assignments:', assignments);
      console.log('Assignments structure:', JSON.stringify(assignments, null, 2));
      
      // Check if assignments has rosters
      if (!assignments.rosters) {
        console.error('❌ ERROR: assignments.rosters is undefined!');
        alert('Error: No roster data found in OCR results. Please check the console for details.');
        return;
      }
      
      const rosterNames = Object.keys(assignments.rosters);
      console.log(`Found ${rosterNames.length} rosters:`, rosterNames);
      
      // Log sample data from each roster
      for (const rosterName of rosterNames) {
        const roster = assignments.rosters[rosterName];
        console.log(`Roster "${rosterName}":`, {
          hitters: roster.hitters?.length || 0,
          pitchers: roster.pitchers?.length || 0,
          sampleHitters: roster.hitters?.slice(0, 3),
          samplePitchers: roster.pitchers?.slice(0, 3)
        });
      }
      
      // Save roster assignments to Firestore
      console.log('Saving roster assignments to Firestore...');
      await saveRosterAssignments(currentUser!.uid, assignments);
      console.log('✅ Roster assignments saved to Firestore');
      
      let hitterUpdates = 0;
      let pitcherUpdates = 0;
      
      // Update all hitters with new roster assignments
      console.log(`Updating ${hitters.length} hitters...`);
      console.log('Sample hitters to check:', hitters.slice(0, 5).map(h => `${h.name} (${h.season})`));
      
      for (const hitter of hitters) {
        try {
          const assignedRoster = assignRosterToPlayer(hitter.name, hitter.season, assignments);
          const newRoster = assignedRoster || '';
          
          // Log all checks for debugging
          if (hitter.name.toLowerCase().includes('ensberg')) {
            console.log(`🔍 Found Ensberg! Name: "${hitter.name}", Season: "${hitter.season}", Current Roster: "${hitter.roster}", Assigned Roster: "${assignedRoster}"`);
          }
          
          if (hitter.roster !== newRoster) {
            console.log(`Updating ${hitter.name} (${hitter.season}): "${hitter.roster}" → "${newRoster}"`);
            await updateHitter(hitter.id, { ...hitter, roster: newRoster });
            hitterUpdates++;
          }
        } catch (err) {
          console.error(`Failed to update hitter ${hitter.name}:`, err);
        }
      }
      
      // Update all pitchers with new roster assignments
      console.log(`Updating ${pitchers.length} pitchers...`);
      for (const pitcher of pitchers) {
        try {
          const assignedRoster = assignRosterToPlayer(pitcher.name, pitcher.season, assignments);
          const newRoster = assignedRoster || '';
          
          if (pitcher.roster !== newRoster) {
            console.log(`Updating ${pitcher.name}: "${pitcher.roster}" → "${newRoster}"`);
            await updatePitcher(pitcher.id, { ...pitcher, roster: newRoster });
            pitcherUpdates++;
          }
        } catch (err) {
          console.error(`Failed to update pitcher ${pitcher.name}:`, err);
        }
      }
      
      console.log(`✅ Roster sync complete: ${hitterUpdates} hitters, ${pitcherUpdates} pitchers updated`);
      alert(`Rosters synced successfully!\n${hitterUpdates} hitters and ${pitcherUpdates} pitchers updated.\n\nThe page will now reload to show your updated rosters across all tabs.`);
      
      // Reload the page to ensure all tabs reflect the updated rosters
      window.location.reload();
    } catch (error) {
      console.error('Failed to sync rosters:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Roster assignments extracted but failed to sync to database.\n\nError: ${errorMessage}\n\nYou can manually sync from Season Hitters/Pitchers pages.`);
    }
  };

  const canProcess = rosterImages.some(r => r.file !== null) && !processing;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Roster Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Upload your roster images to automatically update team assignments
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Clipboard className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              How to use Roster Management
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li><strong>Copy & Paste:</strong> Take screenshots and paste them directly (Ctrl/Cmd+V)</li>
              <li><strong>Or Upload:</strong> Click the upload boxes to select images from your computer</li>
              <li>The system will automatically extract team names and player assignments</li>
              <li>Rosters will be synced to the database and appear in Season Hitters/Pitchers pages</li>
              <li>Supported formats: JPG, PNG, WEBP</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rosterImages.map((roster, index) => (
          <div
            key={roster.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Roster Image {index + 1}
              </h3>
            </div>

            <div className="p-4">
              {!roster.preview ? (
                <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 text-center px-4">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    PNG, JPG, WEBP up to 10MB
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(index, file);
                    }}
                  />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={roster.preview}
                      alt={`Roster ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    {roster.status === 'processing' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      </div>
                    )}
                    {roster.status === 'success' && (
                      <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    )}
                    {roster.status === 'error' && (
                      <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
                        <AlertCircle className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>

                  {roster.status === 'success' && roster.extractedData && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                        {roster.extractedData.teamName}
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        {roster.extractedData.hitters.length} hitters, {roster.extractedData.pitchers.length} pitchers
                      </p>
                    </div>
                  )}

                  {roster.status === 'error' && roster.error && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                      <p className="text-sm text-red-900 dark:text-red-100">
                        {roster.error}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => handleRemoveImage(index)}
                    disabled={processing}
                    className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={processRosterImagesHandler}
          disabled={!canProcess}
          className="px-8 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
        >
          {processing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing Rosters...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5" />
              Process & Update Rosters
            </>
          )}
        </button>
      </div>

      {rosterImages.some(r => r.status === 'success') && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                Rosters Processed Successfully!
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                Your roster assignments have been extracted and saved. All team management tabs (Lineup Optimizer, Pitching Rotation, Hitter/Pitcher Preferences, Team Strategy) will automatically update with your Manhattan WOW Award Stars roster.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Current Database Stats
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Hitters</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{hitters.length}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Pitchers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{pitchers.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
