import { exec, execSync } from "child_process";
import { ActionPanel, List, Action, closeMainWindow, getPreferenceValues } from "@raycast/api";
import { useExec } from "@raycast/utils";
import * as fs from "fs";
import * as path from "path";
const untildify = require('untildify');


interface Preferences {
    path: string;
    configPath: string;
}

function OpenWith(app: string, repo: string) {
    exec(`${app} ~/src/${repo}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`)
            return
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
}

type App = {
    name: string
    executable: string
}
const defaultApps = [
    {name: "Finder", executable: "open"},
    {name: "Goland",   executable: "goland"},
    {name: "RubyMine", executable: "rubymine"},
    {name: "WebStorm", executable: "webstorm"},
]

export default function Command() {
    const preferences = getPreferenceValues<Preferences>();
    process.env.PATH = `/opt/homebrew/bin/:/usr/bin/:/usr/local/bin/:` + preferences.path
    const s = fs.readFileSync(untildify(preferences.configPath))
    const apps = defaultApps.concat(JSON.parse(s).apps)

    const { isLoading, data, revalidate } = useExec("ghq", ["list"], {});
    const results = data?.split("\n") || []

    return (
        <List isLoading={isLoading}>
            {results.map((repo: string) => {
                return (
                    <List.Item
                        key={repo}
                        icon="list-icon.png"
                        title={repo}
                        actions={
                            <ActionPanel>
                                {
                                    apps.map((app: App) => {
                                        const title = "Open by "+app.name
                                        return (
                                            <Action title={title} onAction={() => {
                                                OpenWith(app.executable, repo)
                                                closeMainWindow();
                                            }}
                                            />
                                        )
                                    })
                                }
                            </ActionPanel>
                        }
                    />
                )
            })}
        </List>
    )
}
