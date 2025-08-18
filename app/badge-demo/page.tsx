'use client';

import React, { useState } from 'react';
import { BadgeSelector, BadgeDisplay, Badge, getAllBadgeValues } from '@/_components/ui/badge';

export default function BadgeDemoPage() {
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [displayMode, setDisplayMode] = useState<'grid' | 'inline' | 'compact'>('grid');
  const [badgeSize, setBadgeSize] = useState<'sm' | 'md' | 'lg'>('md');

  const handleBadgeSelection = (badges: string[]) => {
    setSelectedBadges(badges);
  };

  const allBadgeValues = getAllBadgeValues();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Badge System Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive badge system for selecting and displaying verification badges, health certificates, and more.
            Use this system in forms, listings, and anywhere you need to showcase credentials.
          </p>
        </div>

        {/* Badge Selector Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Badge Selection
          </h2>
          <p className="text-gray-600 mb-6">
            Select badges from the compact grid below. These can be used in forms, listings, and profiles.
          </p>
          
          <BadgeSelector
            value={selectedBadges}
            onChange={handleBadgeSelection}
            size="md"
            showCategories={false}
            maxSelection={6}
          />

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Selected badges: {selectedBadges.length > 0 ? selectedBadges.join(', ') : 'None'}
            </p>
          </div>
        </div>

        {/* Badge Display Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Badge Display
          </h2>
          
          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Mode
              </label>
              <select
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value as 'grid' | 'inline' | 'compact')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="grid">Grid Layout</option>
                <option value="inline">Inline Layout</option>
                <option value="compact">Compact Layout</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Badge Size
              </label>
              <select
                value={badgeSize}
                onChange={(e) => setBadgeSize(e.target.value as 'sm' | 'md' | 'lg')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>
          </div>

          {/* Display Modes */}
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Badges</h3>
              {selectedBadges.length > 0 ? (
                <BadgeDisplay
                  badges={selectedBadges}
                  size={badgeSize}
                  layout={displayMode}
                  showLabels={true}
                />
              ) : (
                <p className="text-gray-500 italic">No badges selected</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">All Available Badges</h3>
              <BadgeDisplay
                badges={allBadgeValues}
                size={badgeSize}
                layout={displayMode}
                showLabels={true}
                maxDisplay={8}
              />
            </div>
          </div>
        </div>

        {/* Individual Badge Examples */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Individual Badge Examples
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Selectable Badge</h3>
              <Badge
                value="Vet Checked"
                size="lg"
                variant="selectable"
                selected={selectedBadges.includes('Vet Checked')}
                onClick={() => {
                  if (selectedBadges.includes('Vet Checked')) {
                    setSelectedBadges(selectedBadges.filter(b => b !== 'Vet Checked'));
                  } else {
                    setSelectedBadges([...selectedBadges, 'Vet Checked']);
                  }
                }}
                showLabel={true}
              />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Display Badge</h3>
              <Badge
                value="Purebred Certified"
                size="lg"
                variant="display"
                selected={true}
                showLabel={true}
              />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Compact Badge</h3>
              <Badge
                value="Microchip Number Verified"
                size="md"
                variant="compact"
                selected={true}
                showLabel={false}
              />
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Usage Examples
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Form Integration</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">
                  Use BadgeSelector in forms to collect badge selections:
                </p>
                <code className="text-xs bg-gray-800 text-white p-2 rounded block">
                  {`<BadgeSelector
  value={selectedBadges}
  onChange={setSelectedBadges}
  size="md"
  showCategories={false}
/>`}
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Display Integration</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">
                  Use BadgeDisplay to show selected badges:
                </p>
                <code className="text-xs bg-gray-800 text-white p-2 rounded block">
                  {`<BadgeDisplay
  badges={listing.badges}
  size="md"
  layout="inline"
  showLabels={true}
/>`}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 