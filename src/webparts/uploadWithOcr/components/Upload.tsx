import { SPFI } from "@pnp/sp";
import { IDocumentLibraryInformation } from "@pnp/sp/sites";
import { Dropdown, IDropdown, IDropdownOption, Label, PrimaryButton, Spinner, TextField } from "office-ui-fabric-react";
import * as React from "react";
import useLibraries from "../hooks/useLibraries";
import styles from "./UploadWithOcr.module.scss";

interface IUploadProps {
    submit: Function;
    sp: SPFI;
    hidden: boolean;
}

interface IUploadState {
    selectedLib: string;
    docName: string;
}

const Upload: React.FC<IUploadProps> = ({ submit, sp, hidden }) => {
    const [uploading, setUploading] = React.useState<boolean>(false);
    const [libs, setLibs] = React.useState<IDropdownOption[]>([]);
    const [state, setState] = React.useState<IUploadState>({
        selectedLib: '',
        docName: ''
    });

    const { getLibraries } = useLibraries({ sp });

    React.useEffect(() => {
        async function get() {
            const list: IDocumentLibraryInformation[] = await getLibraries();
            const def: IDocumentLibraryInformation = list.find((l: any) => l.IsDefaultDocumentLibrary === true);
            const options: IDropdownOption[] = list.reduce((prev: IDropdownOption[], curr: IDocumentLibraryInformation) => {
                prev.push({
                    key: curr.Title,
                    text: curr.Title
                });

                return prev;
            }, []);
            setLibs(options);
            setState(s => {
                return {
                    ...s,
                    selectedLib: def.Title
                }
            });
        }

        Promise.resolve(get());
    }, []);

    function handleLibraryChange(e: React.FormEvent<HTMLDivElement>, option: IDropdownOption): void {
        setState(s => {
            return {
                ...s,
                selectedLib: option.text
            }
        });
    }

    function handleNameChange(e: React.FormEvent<HTMLInputElement>, val: string): void {
        setState(s => {
            return {
                ...s,
                docName: val
            }
        });
    }

    async function onSubmit() {
        setUploading(true);

        try {
            await submit(state.docName, state.selectedLib);
        }
        catch(e) {
            console.log(e);
        }

        setUploading(false);
    }

    if (hidden) {
        return <></>
    }

    return (
        <>
            <Label>
                Destination Library
            </Label>
            <Dropdown
                selectedKey={state.selectedLib}
                options={libs}
                onChange={handleLibraryChange}
                className={styles.input}
                id="selectedLibrary"
            />
            <Label>
                Document Name
            </Label>
            <TextField
                value={state.docName}
                onChange={handleNameChange}
                className={styles.input}
                suffix=".pdf"
            />
            <PrimaryButton onClick={onSubmit} disabled={uploading}>
                {uploading ? <Spinner /> : 'Upload'}
            </PrimaryButton>
        </>
    );
}

export default Upload;