'use client';

import { useMemo } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { validateAdContent } from '@/lib/utils';
import { AdContent } from '@/types/platforms';
import { cn } from '@/lib/utils';

interface ValidationPanelProps {
  content: AdContent;
  platformId?: string;
  formatId?: string;
  allCombinations?: Array<{ platformId: string; formatId: string }>;
  className?: string;
}

export function ValidationPanel({
  content,
  platformId,
  formatId,
  allCombinations,
  className
}: ValidationPanelProps) {
  const currentValidation = useMemo(() => {
    if (!platformId || !formatId) {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        questionable: [],
        recommendations: []
      };
    }
    
    return validateAdContent(content, platformId, formatId);
  }, [content, platformId, formatId]);

  const allValidations = useMemo(() => {
    if (!allCombinations || allCombinations.length === 0) {
      return [];
    }
    
    return allCombinations.map(combination => ({
      ...combination,
      validation: validateAdContent(content, combination.platformId, combination.formatId)
    }));
  }, [content, allCombinations]);

  const summaryStats = useMemo(() => {
    if (allValidations.length === 0) {
      return { totalErrors: 0, totalWarnings: 0, totalQuestionable: 0, validCount: 0 };
    }
    
    return allValidations.reduce((stats, { validation }) => {
      return {
        totalErrors: stats.totalErrors + validation.errors.length,
        totalWarnings: stats.totalWarnings + validation.warnings.length,
        totalQuestionable: stats.totalQuestionable + validation.questionable.length,
        validCount: stats.validCount + (validation.isValid ? 1 : 0)
      };
    }, { totalErrors: 0, totalWarnings: 0, totalQuestionable: 0, validCount: 0 });
  }, [allValidations]);

  // Show multiple combinations validation
  if (allCombinations && allCombinations.length > 1) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Validation Summary</h3>
          <div className="text-sm text-gray-500">
            {allCombinations.length} formats
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
            <div className="text-lg font-semibold text-green-700">{summaryStats.validCount}</div>
            <div className="text-xs text-green-600">Valid</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
            <div className="text-lg font-semibold text-red-700">{summaryStats.totalErrors}</div>
            <div className="text-xs text-red-600">Critical</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-center">
            <div className="text-lg font-semibold text-orange-700">{summaryStats.totalQuestionable}</div>
            <div className="text-xs text-orange-600">Questionable</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
            <div className="text-lg font-semibold text-yellow-700">{summaryStats.totalWarnings}</div>
            <div className="text-xs text-yellow-600">Warnings</div>
          </div>
        </div>

        {/* Current Preview Validation */}
        {platformId && formatId && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2 text-sm">Current Preview</h4>
            <ValidationResults validation={currentValidation} />
          </div>
        )}

        {/* Issues List */}
        {(summaryStats.totalErrors > 0 || summaryStats.totalWarnings > 0 || summaryStats.totalQuestionable > 0) && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2 text-sm">Issues by Format</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {allValidations.map(({ platformId: pid, formatId: fid, validation }) => {
                if (validation.errors.length === 0 && validation.warnings.length === 0 && validation.questionable.length === 0) return null;
                
                return (
                  <div key={`${pid}-${fid}`} className="bg-gray-50 rounded p-2 text-sm">
                    <div className="font-medium text-gray-700 mb-1">
                      {pid.charAt(0).toUpperCase() + pid.slice(1)} - {fid.replace('_', ' ')}
                    </div>
                    {validation.errors.map((error, i) => (
                      <div key={i} className="flex items-center space-x-1 text-red-600">
                        <XCircle className="w-3 h-3" />
                        <span className="text-xs">{error}</span>
                      </div>
                    ))}
                    {validation.questionable.map((questionable, i) => (
                      <div key={i} className="flex items-center space-x-1 text-orange-600">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-xs">{questionable}</span>
                      </div>
                    ))}
                    {validation.warnings.map((warning, i) => (
                      <div key={i} className="flex items-center space-x-1 text-yellow-600">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-xs">{warning}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Single platform/format validation (original behavior)
  if (!platformId || !formatId) {
    return (
      <div className={cn("p-4 bg-gray-50 rounded-lg", className)}>
        <div className="flex items-center space-x-2 text-gray-500">
          <Info className="w-5 h-5" />
          <span>Select a platform and format to see validation results</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center space-x-2">
        <h3 className="font-semibold">Validation Results</h3>
        {currentValidation.isValid ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
      </div>

      <ValidationResults validation={currentValidation} />
    </div>
  );
}

interface ValidationResultsProps {
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    questionable: string[];
    recommendations: string[];
  };
}

function ValidationResults({ validation }: ValidationResultsProps) {
  return (
    <div className="space-y-3">

      {/* Errors */}
      {validation.errors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center space-x-2 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-medium text-red-800">
              Critical Issues {validation.errors.length > 0 && (
                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full ml-2">
                  {validation.errors.length}
                </span>
              )}
            </h4>
          </div>
          <ul className="space-y-2">
            {validation.errors.map((error, index) => (
              <li key={index} className={cn(
                "text-sm pl-4 flex items-start space-x-2",
                error.includes('CRITICAL') ? "text-red-800 font-semibold" : "text-red-700"
              )}>
                <span className="text-red-500 mt-0.5">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
          
          {/* Special safety zone violation alert */}
          {validation.errors.some(error => error.includes('unsafe zones') || error.includes('CRITICAL')) && (
            <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-xs">
              <div className="flex items-center space-x-1 text-red-700 font-medium">
                <AlertTriangle className="w-3 h-3" />
                <span>COMPLIANCE ALERT</span>
              </div>
              <p className="text-red-600 mt-1">
                Your ad may not display properly and could be rejected by the platform.
                Move critical content into the safe area (outlined region) immediately.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Questionable Issues */}
      {validation.questionable.length > 0 && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h4 className="font-medium text-orange-800">
              Questionable Design Elements {validation.questionable.length > 0 && (
                <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full ml-2">
                  {validation.questionable.length}
                </span>
              )}
            </h4>
          </div>
          <ul className="space-y-1">
            {validation.questionable.map((questionable, index) => (
              <li key={index} className="text-sm text-orange-700 pl-4">
                • {questionable}
              </li>
            ))}
          </ul>
          <div className="mt-2 p-2 bg-orange-100 border border-orange-300 rounded text-xs">
            <p className="text-orange-700">
              <strong>Note:</strong> These elements may be acceptable if they&apos;re decorative, but critical content (text, logos, CTAs) should be moved to safe areas.
            </p>
          </div>
        </div>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h4 className="font-medium text-yellow-800">Warnings</h4>
          </div>
          <ul className="space-y-1">
            {validation.warnings.map((warning, index) => (
              <li key={index} className="text-sm text-yellow-700 pl-4">
                • {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {validation.recommendations.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-blue-800">Recommendations</h4>
          </div>
          <ul className="space-y-1">
            {validation.recommendations.map((recommendation, index) => (
              <li key={index} className="text-sm text-blue-700 pl-4">
                • {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* All good message */}
      {validation.isValid && validation.warnings.length === 0 && validation.questionable.length === 0 && validation.recommendations.length === 0 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">Perfect! Your ad meets all requirements.</span>
          </div>
        </div>
      )}
    </div>
  );
} 