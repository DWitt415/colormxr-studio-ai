import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, useState, useEffect } from 'react'
import supabase from '@/utils/supabase'

function SeriesGalleryAddModal({ 
  isOpen, 
  closeModal, 
  onSelectSeries, 
  type = 'composition', // 'composition' or 'palette'
  autoGenerateName = true // Whether to auto-generate a name based on date
}) {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const storageKey = `lastSelectedSeries_${type}`;
      const lastSelected = localStorage.getItem(storageKey);
      return lastSelected || 'singles';
    }
    return 'singles';
  });
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState('');

  // Helper function to generate series name with sequential numbering
  const generateSequentialSeriesName = (seriesList) => {
    // Create date string in MM-DD-YYYY format
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).replace(/\//g, '-');
    
    // Find highest number for this date
    const baseNamePattern = `${dateString} series`;
    const existingSeriesForDate = seriesList.filter(s => 
      s.name && s.name.startsWith(baseNamePattern)
    );
    
    // Default to 1 if no series exist for this date yet
    let nextNumber = 1;
    
    if (existingSeriesForDate.length > 0) {
      // Extract numbers from existing series names
      const existingNumbers = existingSeriesForDate.map(s => {
        // Try to extract the number from the end of the name
        const match = s.name.match(/series\s+(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      });
      
      // Find the highest number and add 1
      nextNumber = Math.max(0, ...existingNumbers) + 1;
    }
    
    return `${dateString} series ${nextNumber}`;
  };
  
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && autoGenerateName) {
      setNewSeriesName(''); // Reset to generate new name after series data loads
    }
  }, [isOpen, autoGenerateName]);
  
  // Fetch existing series of the specified type
  useEffect(() => {
    async function fetchSeries() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('series_gallery')
          .select('*')
          .eq('type', type)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        const seriesData = data || [];
        console.log(`Loaded ${seriesData.length} series of type ${type}`);
        setSeries(seriesData);
        
        // Generate sequential name after loading data
        if (autoGenerateName && !newSeriesName && seriesData) {
          setNewSeriesName(generateSequentialSeriesName(seriesData));
        }
      } catch (err) {
        console.error('Error loading series:', err);
        setError(`Failed to load series: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    
    if (isOpen) {
      fetchSeries();
    }
  }, [isOpen, type, autoGenerateName, newSeriesName]);
  
  // Handle creating a new series
  const handleCreateSeries = async () => {
    if (!newSeriesName.trim()) {
      setError('Please enter a series name');
      return;
    }

    try {
      setLoading(true);

      // Insert the new series
      const { data, error } = await supabase
        .from('series_gallery')
        .insert({
          name: newSeriesName.trim(),
          type: type,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from series creation');
      }

      console.log('Created new series:', data);

      // Select the newly created series
      setSelectedSeriesId(data.id);

      // Save to localStorage for next time
      if (typeof window !== 'undefined') {
        const storageKey = `lastSelectedSeries_${type}`;
        localStorage.setItem(storageKey, data.id);
        console.log(`💾 Saved last selected series: ${data.id} for type: ${type}`);
      }

      // Call the onSelectSeries callback
      onSelectSeries(data);

      // Close the modal
      closeModal();
    } catch (err) {
      console.error('Error creating series:', err);
      setError(`Failed to create series: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle selecting an existing series or singles
  const handleSelectSeries = (selectedSeries) => {
    if (selectedSeries === 'singles') {
      // Save to singles (no series)
      onSelectSeries(null);
      closeModal();
    } else {
      setSelectedSeriesId(selectedSeries.id);
      onSelectSeries(selectedSeries);
      closeModal();
    }
  };

  // Handle OK button click
  const handleOK = () => {
    // Save to localStorage for next time
    if (typeof window !== 'undefined') {
      const storageKey = `lastSelectedSeries_${type}`;
      localStorage.setItem(storageKey, selectedSeriesId);
      console.log(`💾 Saved last selected series: ${selectedSeriesId} for type: ${type}`);
    }

    if (selectedSeriesId === 'singles') {
      onSelectSeries(null);
    } else {
      const selectedSeries = series.find(s => s.id === selectedSeriesId);
      if (selectedSeries) {
        onSelectSeries(selectedSeries);
      }
    }
    closeModal();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={closeModal}>
        <div className="fixed inset-0 z-30 w-screen bg-black/50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300" 
              enterFrom="opacity-0 scale-95" 
              enterTo="opacity-100 scale-100" 
              leave="ease-in duration-200" 
              leaveFrom="opacity-100 scale-100" 
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-xl bg-[#4A4A4A] p-6 shadow-xl transition-all text-bodytext">
                <div className="mb-4 text-left">
                  <h3 className="text-lg font-medium text-[#5670F8] leading-6">
                    Save
                  </h3>
                </div>
                
                {error && (
                  <div className="mb-4 p-2 bg-red-100 border border-red-300 text-red-700 rounded">
                    {error}
                  </div>
                )}
                
                {isCreatingNew ? (
                  <div className="mb-4">
                    <div>
                      <input
                        type="text"
                        id="series-name"
                        className="text-xl font-normal text-white mb-1 bg-transparent border-none outline-none w-full"
                        style={{ fontFamily: "'Open Sans', sans-serif" }}
                        value={newSeriesName}
                        onChange={(e) => setNewSeriesName(e.target.value)}
                        placeholder="Enter series name"
                        autoFocus
                      />
                      <div className="text-sm font-normal text-bodytext">Series Name</div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    {loading ? (
                      <div className="flex justify-center py-4">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto scrollbar-dark">
                        <div className="space-y-0">
                          {/* Singles option at the top */}
                          <div
                            className={`p-3 cursor-pointer transition-colors text-left ${selectedSeriesId === 'singles'
                              ? 'bg-[#5670F8] bg-opacity-20'
                              : 'hover:bg-gray-700'}`}
                            style={{ borderBottom: '0.5px solid #808080' }}
                            onClick={() => setSelectedSeriesId('singles')}
                          >
                            <div className="font-medium text-[#C8C8C8]">Singles</div>
                          </div>

                          {/* Existing series */}
                          {series.map((item) => (
                            <div
                              key={item.id}
                              className={`p-3 cursor-pointer transition-colors text-left ${selectedSeriesId === item.id
                                ? 'bg-[#5670F8] bg-opacity-20'
                                : 'hover:bg-gray-700'}`}
                              style={{ borderBottom: '0.5px solid #808080' }}
                              onClick={() => setSelectedSeriesId(item.id)}
                            >
                              <div className="font-medium text-[#C8C8C8]">{item.name}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-6 gap-3">
                  {isCreatingNew ? (
                    <>
                      <button
                        type="button"
                        className="py-2 px-4 text-gray-400 hover:text-white rounded"
                        onClick={() => setIsCreatingNew(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="py-2 px-6 bg-[#5670F8] text-white rounded hover:bg-[#4560E6] disabled:opacity-50"
                        onClick={handleCreateSeries}
                        disabled={loading || !newSeriesName.trim()}
                      >
                        OK
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="py-2 px-4 text-gray-400 hover:text-white rounded"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          className="py-2 px-4 bg-[#5670F8] text-white rounded hover:bg-[#4560E6]"
                          onClick={() => setIsCreatingNew(true)}
                        >
                          New Series
                        </button>
                        <button
                          type="button"
                          className="py-2 px-6 bg-[#5670F8] text-white rounded hover:bg-[#4560E6]"
                          onClick={handleOK}
                        >
                          OK
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default SeriesGalleryAddModal;
