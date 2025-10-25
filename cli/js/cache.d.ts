/**
 *
 */
declare function getCacheDirectory(): string;
declare function getCachePathForHelp(): string;
declare function loadMainConfigFile(): any;
declare function getExchangeSettings(exchangeId: string): any;
/**
 *
 */
declare function checkCache(): void;
/**
 *
 * @param command
 */
declare function saveCommand(cm: string[]): void;
declare function changeConfigPath(newPath: string): void;
declare function getChartsFolder(): string;
declare function saveChart(name: string, content: string): string;
export { changeConfigPath, checkCache, getCacheDirectory, saveCommand, loadMainConfigFile as loadConfigFile, getExchangeSettings, getCachePathForHelp, getChartsFolder, saveChart, };
