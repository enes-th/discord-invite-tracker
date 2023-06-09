import {
    ApplicationCommand,
    Collection
} from "discord.js";
import MyClient from "../types/class/MyClient";
import Command from "../types/interface/Command";

/**
 *
 * @function
 * @param {MyClient} client
 * @param {Command[]} commands
 * @returns {void}
 */
export async function register(client: MyClient, commands: Command[]): Promise<void> {
    const currentCommands: Collection<string, ApplicationCommand> | undefined = await client.application?.commands.fetch()!;

    const newCommands = commands.filter((command) => !currentCommands.some((c) => c.name === command.name));
    for (const newCommand of newCommands) {
        await client.application?.commands.create(newCommand);
    }

    const deletedCommands = currentCommands.filter((command) => !commands.some((c) => c.name === command.name)).toJSON()!;
    for (const deletedCommand of deletedCommands) {
        await deletedCommand.delete();
    }

    const updatedCommands = commands.filter((command) => currentCommands.some((c) => c.name === command.name));
    for (const updatedCommand of updatedCommands) {
        const newCommand = updatedCommand;
        const previousCommand = currentCommands.find((c) => c.name === updatedCommand.name)!;
        let modified = false;
        if (previousCommand.description !== newCommand.description) modified = true;
        if (!ApplicationCommand.optionsEqual(previousCommand.options ?? [], newCommand.options ?? [])) modified = true;
        if (modified) await previousCommand.edit(newCommand);
    }
}
