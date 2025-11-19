import { usableApi } from '../usable-api/client';
import { TASKABLE_VERSION, TEMPLATE_FRAGMENT, INSTRUCTION_SET_FRAGMENT } from './constants';
import type { Fragment, TaskableConfig } from '@/src/types';

/**
 * Generate instruction set content with template and fragment type references
 */
function generateInstructionSetContent(
  templateFragmentId: string,
  cardsFragmentTypeId?: string,
): string {
  const baseContent = INSTRUCTION_SET_FRAGMENT.content;

  // Add configuration section at the beginning
  const configSection = `# Taskable Configuration

**IMPORTANT**: Use these exact IDs when working with Taskable:

- **Template Fragment ID**: \`${templateFragmentId}\`
  - This is the standard template for creating new todo cards
  - Reference this when users need to see the card structure
  - Use \`get-memory-fragment-content({ fragmentId: "${templateFragmentId}" })\` to view it

${
  cardsFragmentTypeId
    ? `- **Cards Fragment Type ID**: \`${cardsFragmentTypeId}\`
  - This is the fragment type where ALL todo cards must be stored
  - ALWAYS use this exact ID when creating new cards: \`fragmentTypeId: "${cardsFragmentTypeId}"\`
  - NEVER use any other fragment type for todo cards
`
    : '- **Cards Fragment Type ID**: Not configured (cards can be stored in any compatible type)'
}
- **Workspace ID**: Get from user's context or connection info

**Note**: In the code examples below, replace:
- \`<TEMPLATE_FRAGMENT_ID>\` with: \`${templateFragmentId}\`
${cardsFragmentTypeId ? `- \`<CARDS_FRAGMENT_TYPE_ID>\` with: \`${cardsFragmentTypeId}\`` : ''}
- \`<USER_WORKSPACE_ID>\` with the actual workspace ID from user context

---

`;

  return configSection + baseContent;
}

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
export async function checkTemplateStatus(workspaceId: string): Promise<TemplateStatus> {
  try {
    console.log('Checking template status for workspace:', workspaceId);

    // Search for template fragment with version tag
    const templates = await usableApi.listFragments({
      workspaceId,
      tags: ['app:taskable', 'type:taskable-template', `version:${TASKABLE_VERSION}`],
      limit: 10,
    });

    // Search for instruction set fragment with version tag
    const instructionSets = await usableApi.listFragments({
      workspaceId,
      tags: ['app:taskable', 'type:taskable-instruction-set', `version:${TASKABLE_VERSION}`],
      limit: 10,
    });

    console.log('Found templates:', templates.length);
    console.log('Found instruction sets:', instructionSets.length);

    // Get the correct fragment type IDs first
    let templateTypeId: string | undefined;
    let instructionSetTypeId: string | undefined;

    if (templates.length > 0 || instructionSets.length > 0) {
      try {
        const typeIds = await getFragmentTypeIds(workspaceId);
        templateTypeId = typeIds.templateTypeId;
        instructionSetTypeId = typeIds.instructionSetTypeId;
        console.log('Expected fragment types:', { templateTypeId, instructionSetTypeId });
      } catch (error) {
        console.error('Failed to get fragment type IDs:', error);
      }
    }

    // Find template with CORRECT fragment type
    let templateFragment: Fragment | undefined;
    let templateHasCorrectType = false;

    if (templateTypeId) {
      templateFragment = templates.find((t) => t.fragmentTypeId === templateTypeId);
      templateHasCorrectType = !!templateFragment;
      console.log('Found template with correct type:', !!templateFragment);
      if (!templateFragment && templates.length > 0) {
        console.log('No template with correct type found, using first one');
        templateFragment = templates[0];
      }
    } else {
      templateFragment = templates[0];
    }

    console.log('Template fragment:', templateFragment);
    const templateVersion = templateFragment?.tags
      .find((tag) => tag.startsWith('version:'))
      ?.split(':')[1];
    console.log('Template version:', templateVersion, 'Expected:', TASKABLE_VERSION);

    // Find instruction set with CORRECT fragment type
    let instructionSetFragment: Fragment | undefined;
    let instructionSetHasCorrectType = false;

    if (instructionSetTypeId) {
      instructionSetFragment = instructionSets.find(
        (t) => t.fragmentTypeId === instructionSetTypeId,
      );
      instructionSetHasCorrectType = !!instructionSetFragment;
      console.log('Found instruction set with correct type:', !!instructionSetFragment);
      if (!instructionSetFragment && instructionSets.length > 0) {
        console.log('No instruction set with correct type found, using first one');
        instructionSetFragment = instructionSets[0];
      }
    } else {
      instructionSetFragment = instructionSets[0];
    }

    console.log('Instruction set fragment:', instructionSetFragment);
    const instructionSetVersion = instructionSetFragment?.tags
      .find((tag) => tag.startsWith('version:'))
      ?.split(':')[1];
    console.log('Instruction set version:', instructionSetVersion, 'Expected:', TASKABLE_VERSION);

    console.log('Type validation results:', {
      templateHasCorrectType,
      instructionSetHasCorrectType,
    });

    const status: TemplateStatus = {
      template: {
        exists: !!templateFragment && templateHasCorrectType,
        current: templateVersion === TASKABLE_VERSION && templateHasCorrectType,
        fragmentId: templateFragment?.id,
      },
      instructionSet: {
        exists: !!instructionSetFragment && instructionSetHasCorrectType,
        current: instructionSetVersion === TASKABLE_VERSION && instructionSetHasCorrectType,
        fragmentId: instructionSetFragment?.id,
      },
      needsUpdate:
        !templateFragment ||
        !instructionSetFragment ||
        !templateHasCorrectType ||
        !instructionSetHasCorrectType ||
        templateVersion !== TASKABLE_VERSION ||
        instructionSetVersion !== TASKABLE_VERSION,
    };

    console.log('Template status:', status);
    return status;
  } catch (error) {
    console.error('Failed to check template status:', error);
    throw error;
  }
}

/**
 * Get the correct fragment type IDs for Template and Instruction Set
 */
async function getFragmentTypeIds(workspaceId: string): Promise<{
  templateTypeId: string;
  instructionSetTypeId: string;
}> {
  console.log('Fetching fragment types for workspace:', workspaceId);
  const fragmentTypes = await usableApi.getFragmentTypes(workspaceId);
  console.log(
    'Available fragment types:',
    fragmentTypes.map((ft) => ({ name: ft.name, id: ft.id })),
  );

  const templateType = fragmentTypes.find((ft) => ft.name.toLowerCase() === 'template');
  const instructionSetType = fragmentTypes.find(
    (ft) => ft.name.toLowerCase() === 'instruction set',
  );

  console.log('Found Template type:', templateType);
  console.log('Found Instruction Set type:', instructionSetType);

  if (!templateType) {
    throw new Error(
      `Template fragment type not found in workspace. Available types: ${fragmentTypes.map((ft) => ft.name).join(', ')}`,
    );
  }
  if (!instructionSetType) {
    throw new Error(
      `Instruction Set fragment type not found in workspace. Available types: ${fragmentTypes.map((ft) => ft.name).join(', ')}`,
    );
  }

  return {
    templateTypeId: templateType.id,
    instructionSetTypeId: instructionSetType.id,
  };
}

/**
 * Create or update template and instruction set fragments
 */
export async function createOrUpdateTemplates(
  workspaceId: string,
  cardsFragmentTypeId?: string, // The fragment type ID for storing todo cards
): Promise<{ templateId: string; instructionSetId: string }> {
  try {
    console.log('Starting createOrUpdateTemplates for workspace:', workspaceId);
    console.log('Cards fragment type ID:', cardsFragmentTypeId);
    const status = await checkTemplateStatus(workspaceId);

    // Look up the correct fragment type IDs
    const { templateTypeId, instructionSetTypeId } = await getFragmentTypeIds(workspaceId);

    let templateId: string;
    let instructionSetId: string;

    // Handle template fragment
    if (!status.template.exists) {
      console.log('Creating new template fragment');
      console.log('Using templateTypeId:', templateTypeId);
      console.log('Template data:', {
        workspaceId,
        fragmentTypeId: templateTypeId,
        title: TEMPLATE_FRAGMENT.title,
        tags: TEMPLATE_FRAGMENT.tags,
      });
      // Create new template
      const template = await usableApi.createFragment({
        workspaceId,
        fragmentTypeId: templateTypeId,
        ...TEMPLATE_FRAGMENT,
      });
      console.log('Template created with ID:', template.id);
      console.log('Template response:', template);
      templateId = template.id;
    } else if (!status.template.current && status.template.fragmentId) {
      console.log('Template exists but is not current (wrong type or version)');
      console.log('Deleting old template and creating new one...');

      // Delete the old template
      try {
        await usableApi.deleteCard(status.template.fragmentId);
        console.log('Old template deleted');
      } catch (error) {
        console.error('Failed to delete old template:', error);
      }

      // Create new template with correct type
      const template = await usableApi.createFragment({
        workspaceId,
        fragmentTypeId: templateTypeId,
        ...TEMPLATE_FRAGMENT,
      });
      console.log('New template created with ID:', template.id);
      templateId = template.id;
    } else {
      console.log('Using existing template:', status.template.fragmentId);
      if (!status.template.fragmentId) {
        throw new Error('Template fragment ID is missing');
      }
      templateId = status.template.fragmentId;
    }

    // Handle instruction set fragment with dynamic content
    const instructionSetContent = generateInstructionSetContent(templateId, cardsFragmentTypeId);

    if (!status.instructionSet.exists) {
      console.log('Creating new instruction set fragment');
      console.log('Using instructionSetTypeId:', instructionSetTypeId);
      console.log('Instruction set data:', {
        workspaceId,
        fragmentTypeId: instructionSetTypeId,
        title: INSTRUCTION_SET_FRAGMENT.title,
        tags: INSTRUCTION_SET_FRAGMENT.tags,
      });
      // Create new instruction set
      const instructionSet = await usableApi.createFragment({
        workspaceId,
        fragmentTypeId: instructionSetTypeId,
        title: INSTRUCTION_SET_FRAGMENT.title,
        summary: INSTRUCTION_SET_FRAGMENT.summary,
        content: instructionSetContent,
        tags: INSTRUCTION_SET_FRAGMENT.tags,
      });
      console.log('Instruction set created with ID:', instructionSet.id);
      console.log('Instruction set response:', instructionSet);
      instructionSetId = instructionSet.id;
    } else if (!status.instructionSet.current && status.instructionSet.fragmentId) {
      console.log('Instruction set exists but is not current (wrong type or version)');
      console.log('Deleting old instruction set and creating new one...');

      // Delete the old instruction set
      try {
        await usableApi.deleteCard(status.instructionSet.fragmentId);
        console.log('Old instruction set deleted');
      } catch (error) {
        console.error('Failed to delete old instruction set:', error);
      }

      // Create new instruction set with correct type
      const instructionSet = await usableApi.createFragment({
        workspaceId,
        fragmentTypeId: instructionSetTypeId,
        title: INSTRUCTION_SET_FRAGMENT.title,
        summary: INSTRUCTION_SET_FRAGMENT.summary,
        content: instructionSetContent,
        tags: INSTRUCTION_SET_FRAGMENT.tags,
      });
      console.log('New instruction set created with ID:', instructionSet.id);
      instructionSetId = instructionSet.id;
    } else {
      console.log('Using existing instruction set:', status.instructionSet.fragmentId);
      if (!status.instructionSet.fragmentId) {
        throw new Error('Instruction set fragment ID is missing');
      }
      instructionSetId = status.instructionSet.fragmentId;
    }

    console.log('Templates ready:', { templateId, instructionSetId });
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
