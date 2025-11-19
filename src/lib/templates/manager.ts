import { usableApi } from '../usable-api/client';
import { TASKABLE_VERSION, TEMPLATE_FRAGMENT, INSTRUCTION_SET_FRAGMENT } from './constants';
import type { Fragment, TaskableConfig } from '@/src/types';

export interface TemplateStatus {
  template: {
    exists: boolean;
    current: boolean;
    fragmentId?: string;
  };
  instructionSet: {
    exists: boolean;
    current: boolean;
    fragmentId?: string;
  };
  needsUpdate: boolean;
}

/**
 * Check the status of template and instruction set fragments
 */
export async function checkTemplateStatus(
  workspaceId: string,
): Promise<TemplateStatus> {
  try {
    // Search for template fragment
    const templates = await usableApi.listFragments({
      workspaceId,
      tags: ['app:taskable', 'type:taskable-template'],
      limit: 10,
    });

    // Search for instruction set fragment
    const instructionSets = await usableApi.listFragments({
      workspaceId,
      tags: ['app:taskable', 'type:taskable-instruction-set'],
      limit: 10,
    });

    // Check template version
    const templateFragment = templates[0];
    const templateVersion = templateFragment?.tags.find((tag) =>
      tag.startsWith('version:'),
    )?.split(':')[1];

    // Check instruction set version
    const instructionSetFragment = instructionSets[0];
    const instructionSetVersion = instructionSetFragment?.tags.find((tag) =>
      tag.startsWith('version:'),
    )?.split(':')[1];

    const status: TemplateStatus = {
      template: {
        exists: !!templateFragment,
        current: templateVersion === TASKABLE_VERSION,
        fragmentId: templateFragment?.id,
      },
      instructionSet: {
        exists: !!instructionSetFragment,
        current: instructionSetVersion === TASKABLE_VERSION,
        fragmentId: instructionSetFragment?.id,
      },
      needsUpdate:
        !templateFragment ||
        !instructionSetFragment ||
        templateVersion !== TASKABLE_VERSION ||
        instructionSetVersion !== TASKABLE_VERSION,
    };

    return status;
  } catch (error) {
    console.error('Failed to check template status:', error);
    throw error;
  }
}

/**
 * Create or update template and instruction set fragments
 */
export async function createOrUpdateTemplates(
  workspaceId: string,
  fragmentTypeId: string,
): Promise<{ templateId: string; instructionSetId: string }> {
  try {
    const status = await checkTemplateStatus(workspaceId);

    let templateId: string;
    let instructionSetId: string;

    // Handle template fragment
    if (!status.template.exists) {
      // Create new template
      const template = await usableApi.createFragment({
        workspaceId,
        fragmentTypeId,
        ...TEMPLATE_FRAGMENT,
      });
      templateId = template.id;
    } else if (!status.template.current && status.template.fragmentId) {
      // Update existing template
      const template = await usableApi.updateFragment(status.template.fragmentId, {
        ...TEMPLATE_FRAGMENT,
        tags: ['app:taskable', 'type:taskable-template', `version:${TASKABLE_VERSION}`],
      });
      templateId = template.id;
    } else {
      templateId = status.template.fragmentId!;
    }

    // Handle instruction set fragment
    if (!status.instructionSet.exists) {
      // Create new instruction set
      const instructionSet = await usableApi.createFragment({
        workspaceId,
        fragmentTypeId,
        ...INSTRUCTION_SET_FRAGMENT,
      });
      instructionSetId = instructionSet.id;
    } else if (!status.instructionSet.current && status.instructionSet.fragmentId) {
      // Update existing instruction set
      const instructionSet = await usableApi.updateFragment(
        status.instructionSet.fragmentId,
        {
          ...INSTRUCTION_SET_FRAGMENT,
          tags: ['app:taskable', 'type:taskable-instruction-set', `version:${TASKABLE_VERSION}`],
        },
      );
      instructionSetId = instructionSet.id;
    } else {
      instructionSetId = status.instructionSet.fragmentId!;
    }

    return { templateId, instructionSetId };
  } catch (error) {
    console.error('Failed to create/update templates:', error);
    throw error;
  }
}

/**
 * Save template configuration to storage
 */
export function saveTemplateConfig(
  config: TaskableConfig,
  templateId: string,
  instructionSetId: string,
): TaskableConfig {
  return {
    ...config,
    templatesConfig: {
      templateFragmentId: templateId,
      instructionSetFragmentId: instructionSetId,
      version: TASKABLE_VERSION,
      lastChecked: new Date().toISOString(),
    },
  };
}

/**
 * Check if templates need checking (cache for 24 hours)
 */
export function shouldCheckTemplates(config: TaskableConfig): boolean {
  if (!config.templatesConfig?.lastChecked) {
    return true;
  }

  const lastChecked = new Date(config.templatesConfig.lastChecked);
  const now = new Date();
  const hoursSinceCheck = (now.getTime() - lastChecked.getTime()) / (1000 * 60 * 60);

  // Check every 24 hours
  return hoursSinceCheck >= 24;
}

