import { Plugin, TFile } from 'obsidian';

export default class MyPlugin extends Plugin {
  async onload() {
    const filePath = 'C:\\Users\\santa\\OneDrive\\Programing\\Ob_Plug\\Papers\\My Library.bib';


    try {
      // Fetch the initial content
      const initialContent = await this.fetchBibFileContent(filePath);
      console.log('Initial content:', initialContent);

      // Process the initial content
      await this.processBibFileContent(initialContent);

      // Subscribe to file change events
      this.registerEvent(
        this.app.vault.on('modify', async (file) => {
          if (file.path === filePath) {
            // Fetch the updated content
            const updatedContent = await this.fetchBibFileContent(filePath);
            console.log('Updated content:', updatedContent);

            // Process the updated content
            await this.processBibFileContent(updatedContent);
          }
        })
      );
    } catch (error) {
      console.error('Error while fetching/processing content:', error);
    }
  }

  async fetchBibFileContent(filePath: string): Promise<string> {
    const fileData = await this.app.vault.adapter.read(filePath);
    return fileData;
  }

  async processBibFileContent(content: string): Promise<void> {
    // Split content into individual entries based on the BibTeX entry delimiter
    const entries = content.split('\n@');

    for (const entry of entries) {
      if (entry.trim() === '') continue; // Skip empty entries

      // Extract the entry key from the first line
      const entryKeyMatch = entry.match(/^article{(.+?),/);
      if (!entryKeyMatch) continue; // Skip invalid entries
      const entryKey = entryKeyMatch[1];

      // Generate the file name based on the entry key
      const fileName = `@${entryKey}.md`;

      // Generate the file path within the "Papers" folder
      const filePath = `Papers/${fileName}`;

      // Check if the file already exists
      const existingFile = this.app.vault.getAbstractFileByPath(filePath);
      if (existingFile instanceof TFile) {
        // File already exists, update its content
        await this.app.vault.modify(existingFile, entry);
        console.log('Updated file:', filePath);
      } else {
        // File doesn't exist, create a new file
        await this.app.vault.create(filePath, '');
        const file = this.app.vault.getAbstractFileByPath(filePath);
        if (file instanceof TFile) {
          await this.app.vault.modify(file, entry);
          console.log('Created file:', filePath);
        }
      }
    }
  }
}
