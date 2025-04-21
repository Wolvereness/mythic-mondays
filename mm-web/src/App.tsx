import React, {
    ChangeEvent,
    Dispatch,
    ReactElement,
    SetStateAction,
    useCallback,
    useMemo,
    useRef,
    useState
} from 'react';
import './App.css';
import {
    Box,
    Button,
    Container,
    createTheme,
    CssBaseline, Paper,
    Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField,
    ThemeProvider,
    Typography,
} from '@mui/material';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';

type PreferenceValue = 1 | 2 | 3;
type Participant = {
    name: string;
} & ({
    damage: PreferenceValue;
    healer?: PreferenceValue;
    tank?: PreferenceValue;
} | {
    damage?: PreferenceValue;
    healer: PreferenceValue;
    tank?: PreferenceValue;
} | {
    damage?: PreferenceValue;
    healer?: PreferenceValue;
    tank: PreferenceValue;
});

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

function shuffleInPlace<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const rand = Math.floor(Math.random() * (i + 1));
        [array[i], array[rand]] = [array[rand], array[i]];
    }
}

function RoleSelect({status, setStatus}: {
    status?: PreferenceValue;
    setStatus: Dispatch<SetStateAction<PreferenceValue | undefined>>,
}): ReactElement {
    const pressPreferred = useCallback(
        () => {
            setStatus(
                (previous: PreferenceValue | undefined) =>
                    previous === 3 ? undefined : 3,
            );
        },
        [setStatus],
    );
    const pressFallback = useCallback(
        () => {
            setStatus(
                (previous: PreferenceValue | undefined) =>
                    previous === 2 ? undefined : 2,
            );
        },
        [setStatus],
    );
    const pressWilling = useCallback(
        () => {
            setStatus(
                (previous: PreferenceValue | undefined) =>
                    previous === 1 ? undefined : 1,
            );
        },
        [setStatus],
    );
    return (<>
        <Button
            variant={status === 3 ? 'contained' : 'outlined'}
            className="participantToggle"
            onClick={pressPreferred}
        >
            <Switch
                onSelect={pressPreferred}
                color="default"
                checked={status === 3}
            />Preferred
        </Button>
        <Button
            variant={status === 2 ? 'contained' : 'outlined'}
            className="participantToggle"
            onClick={pressFallback}
        >
            <Switch
                onSelect={pressFallback}
                color="default"
                checked={status === 2}
            />Fallback
        </Button>
        <Button
            variant={status === 1 ? 'contained' : 'outlined'}
            className="participantToggle"
            onClick={pressWilling}
        >
            <Switch
                onSelect={pressWilling}
                color="default"
                checked={status === 1}
            />Willing
        </Button>
    </>);
}

interface InputParticipantProps {
    setList: (value: (((prevState: Array<Participant>) => Array<Participant>) | Array<Participant>)) => void,
    showOutput: React.JSX.Element,
}

function InputParticipant({setList, showOutput}: InputParticipantProps): ReactElement {
    const [name, setName] = useState<string>('');
    const [tankStatus, setTankStatus] = useState<PreferenceValue | undefined>();
    const [healerStatus, setHealerStatus] = useState<PreferenceValue | undefined>();
    const [damageStatus, setDamageStatus] = useState<PreferenceValue | undefined>();
    const handleNameInput = useCallback(
        (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => setName(e.target.value),
        [setName],
    );
    const inputFieldRef = useRef<HTMLInputElement | null>(null);

    const handleAddParticipant = useCallback(
        () => {
            const newParticipant = {
                name,
                healer: healerStatus as PreferenceValue,
                tank: tankStatus as PreferenceValue,
                damage: damageStatus as PreferenceValue,
            };

            setName('');
            setHealerStatus(undefined);
            setTankStatus(undefined);
            setDamageStatus(undefined);
            setList((list: Array<Participant>) => {
                if (!newParticipant.name || !(newParticipant.damage || newParticipant.healer || newParticipant.tank)) {
                    return list;
                }
                return [
                    ...list,
                    newParticipant,
                ];
            });
            setTimeout(() => {
                inputFieldRef.current?.focus();
            });
        },
        [
            setTankStatus,
            tankStatus,
            setHealerStatus,
            healerStatus,
            setDamageStatus,
            damageStatus,
            setName,
            name,
            setList,
        ],
    );
    return (
        <Box className="participantInput">
            <Stack direction="column" spacing={1}>
                <Stack direction="row" spacing={2}>
                    <TextField
                        className="participantName"
                        label="Name"
                        variant="outlined"
                        value={name}
                        onChange={handleNameInput}
                        inputRef={inputFieldRef}
                    />
                    <Button
                        variant="outlined"
                        disabled={(!tankStatus && !healerStatus && !damageStatus) || !name}
                        onClick={handleAddParticipant}
                    >Add</Button>
					{showOutput}
                </Stack>
                <Stack direction="row" spacing={2}>
                    <Stack direction="column" spacing={1}>
                        <Typography variant="h6">Tank</Typography>
                        <RoleSelect status={tankStatus} setStatus={setTankStatus}/>
                    </Stack>
                    <Stack direction="column" spacing={1}>
                        <Typography variant="h6">Healer</Typography>
                        <RoleSelect status={healerStatus} setStatus={setHealerStatus}/>
                    </Stack>
                    <Stack direction="column" spacing={1}>
                        <Typography variant="h6">Damage</Typography>
                        <RoleSelect status={damageStatus} setStatus={setDamageStatus}/>
                    </Stack>
                </Stack>
            </Stack>
        </Box>
    );
}

const sampleData: Array<Participant> = [];

function ParticipantEntry({participant, index, setList, rename}: {
    index: number,
    setList: (value: (((prevState: Array<Participant>) => Array<Participant>) | Array<Participant>)) => void,
    participant: Participant,
    rename?: undefined,
} | {
    participant: Participant,
    index?: undefined,
    setList?: undefined,
    rename: string | undefined,
}) {
    const handleRemove = useCallback(
        () => setList?.(
            list =>
                // @ts-ignore
                list.toSpliced(index, 1),
        ),
        [setList, index],
    );
    return (<Button
        style={{width: '10REM'}}
        size="small"
        color="inherit"
        onClick={handleRemove}
    >
        <Typography noWrap>{rename || participant.name}</Typography>
    </Button>);
}

type TeamSet = {
    tanks: Participant[],
    healers: Participant[],
    damage: Participant[],
};

function settleTeams(list: Participant[]): TeamSet {
    const out: TeamSet = {
        tanks: [],
        healers: [],
        damage: [],
    };

    type Weighted = { weight: PreferenceStrength };
    type WeightedParticipant = Participant & Weighted;

    // Strong -> Prefer + Willing
    // Normal -> Fallback + Willing
    // Weak -> Prefer + Fallback
    enum PreferenceStrength {
        StrongLeft,
        Left,
        WeakLeft,
        Equal,
        WeakRight,
        Right,
        StrongRight,
    }

    function getPreferenceStrength(left?: PreferenceValue, right?: PreferenceValue): PreferenceStrength {
        if (!left || !right) {
            // eslint-disable-next-line no-throw-literal
            throw `${left} | ${right}`;
        }
        if (left > right) {
            if (left === 3 && right === 1) {
                return PreferenceStrength.StrongLeft;
            }
            if (left === 2) {
                return PreferenceStrength.Left;
            }
            return PreferenceStrength.WeakLeft;
        } else if (left < right) {
            if (right === 3 && left === 1) {
                return PreferenceStrength.StrongRight;
            }
            if (right === 2) {
                return PreferenceStrength.Right;
            }
            return PreferenceStrength.WeakRight;
        }
        return PreferenceStrength.Equal;
    }

    const leftover = {
        tankHealer: [] as WeightedParticipant[],
        tankDamage: [] as WeightedParticipant[],
        healerDamage: [] as WeightedParticipant[],
        flex: [] as Participant[],
    };

    {
        const quickTable = [
            (p: Participant) => {
                throw p;
            }, // not possible
            (p: Participant) => out.tanks.push(p), // 0b001
            (p: Participant) => out.healers.push(p), // 0b010
            (p: Participant) => leftover.tankHealer.push({...p, weight: getPreferenceStrength(p.tank, p.healer)}), // 0b011
            (p: Participant) => out.damage.push(p), // 0b100
            (p: Participant) => leftover.tankDamage.push({...p, weight: getPreferenceStrength(p.tank, p.damage)}), // 0b101
            (p: Participant) => leftover.healerDamage.push({...p, weight: getPreferenceStrength(p.healer, p.damage)}), // 0b110
            (p: Participant) => leftover.flex.push(p), // 0b111
        ];
        for (const participant of list) {
            quickTable[
            (participant.tank ? 0b001 : 0)
            + (participant.healer ? 0b010 : 0)
            + (participant.damage ? 0b100 : 0)
                ]
            (participant);
        }
    }

    ([leftover.tankHealer, leftover.tankHealer, leftover.healerDamage])
        .forEach(participants => participants.sort(
            (l, r) => l.weight - r.weight,
        ));

    const scores = {
        tankHealer: [0],
        tankDamage: [0],
        healerDamage: [0],
        flex: [[0]],
    };

    function calculateScore(leftSelect: number, weighted: Weighted[]): number {
        let score = 0;
        for (let ix = 0; ix < leftSelect; ix++) {
            switch (weighted[ix].weight) {
                case PreferenceStrength.StrongLeft:
                case PreferenceStrength.Left:
                case PreferenceStrength.WeakLeft:
                case PreferenceStrength.Equal:
                    break;
                case PreferenceStrength.WeakRight:
                    score += 10;
                    break;
                case PreferenceStrength.Right:
                    score += 100;
                    break;
                case PreferenceStrength.StrongRight:
                    score += 500;
                    break;
            }
        }
        for (let ix = leftSelect; ix < weighted.length; ix++) {
            switch (weighted[ix].weight) {
                case PreferenceStrength.StrongRight:
                case PreferenceStrength.Right:
                case PreferenceStrength.WeakRight:
                case PreferenceStrength.Equal:
                    break;
                case PreferenceStrength.WeakLeft:
                    score += 10;
                    break;
                case PreferenceStrength.Left:
                    score += 100;
                    break;
                case PreferenceStrength.StrongLeft:
                    score += 500;
                    break;
            }
        }
        return score;
    }

    for (let ix = 0; ix < leftover.tankHealer.length; ix++) {
        scores.tankHealer[ix] = calculateScore(ix, leftover.tankHealer);
    }
    for (let ix = 0; ix < leftover.tankDamage.length; ix++) {
        scores.tankDamage[ix] = calculateScore(ix, leftover.tankDamage);
    }
    for (let ix = 0; ix < leftover.healerDamage.length; ix++) {
        scores.healerDamage[ix] = calculateScore(ix, leftover.healerDamage);
    }
    for (let tanks = 0; tanks < leftover.flex.length; tanks++) {
        const subFlex: number[] = scores.flex[tanks] = [0];
        for (let healers = 0; healers + tanks < leftover.flex.length; healers++) {
            subFlex[healers] = 0; // FIXME
        }
    }

    const current = {
        tankHealer: 0,
        tankDamage: 0,
        healerDamage: 0,
        flexT: 0,
        flexH: 0,
        score: 0,
    };
    const currentPugs = {
        tanks: 0,
        healers: 0,
        damage: 0,
    };

    function setCurrentPugs() {
        const tankCount = out.tanks.length
            + current.tankHealer
            + current.tankDamage
            + current.flexT;
        const healerCount = out.healers.length
            + (leftover.tankHealer.length - current.tankHealer)
            + current.healerDamage
            + current.flexH;
        const damageCount = out.damage.length
            + (leftover.tankDamage.length - current.tankDamage)
            + (leftover.healerDamage.length - current.healerDamage)
            + (leftover.flex.length - current.flexT - current.flexH);

        const tankEffective = tankCount * 3;
        const healerEffective = healerCount * 3;
        const damageEffective = Math.ceil(damageCount / 3) * 3;
        const maxEffective = Math.max(tankEffective, healerEffective, damageEffective);

        currentPugs.tanks = (maxEffective - tankEffective) / 3;
        currentPugs.healers = (maxEffective - healerEffective) / 3;
        currentPugs.damage = maxEffective - damageCount;
    }

    function setCurrentScore() {
        current.score = scores.tankHealer[current.tankHealer]
            + scores.tankDamage[current.tankDamage]
            + scores.healerDamage[current.healerDamage]
            + scores.flex[current.flexT][current.flexH];
    }

    setCurrentScore();
    setCurrentPugs();

    const best = {
        tankHealer: 0,
        tankDamage: 0,
        healerDamage: 0,
        flexT: 0,
        flexH: 0,
        score: current.score,
    };
    const bestPugs = {
        tanks: currentPugs.tanks,
        healers: currentPugs.healers,
        damage: currentPugs.damage,
    };

    enum Should {
        Yes,
        Maybe,
        No,
    }

    function shouldUpdateBestForPugs(): Should {
        if (bestPugs.tanks + bestPugs.healers < currentPugs.tanks + currentPugs.healers) {
            return Should.No;
        }
        if (bestPugs.tanks + bestPugs.healers > currentPugs.tanks + currentPugs.healers) {
            return Should.Yes;
        }
        if (bestPugs.damage < currentPugs.damage) {
            return Should.No;
        }
        if (bestPugs.damage > currentPugs.damage) {
            return Should.Yes;
        }
        if (bestPugs.tanks < currentPugs.tanks) {
            return Should.No;
        }
        if (bestPugs.tanks > currentPugs.tanks) {
            return Should.Yes;
        }
        return Should.Maybe;
    }

    function setCurrentAsBest() {
        best.tankHealer = current.tankHealer;
        best.tankDamage = current.tankDamage;
        best.healerDamage = current.healerDamage;
        best.flexT = current.flexT;
        best.flexH = current.flexH;
        best.score = current.score;
        bestPugs.tanks = currentPugs.tanks;
        bestPugs.healers = currentPugs.healers;
        bestPugs.damage = currentPugs.damage;
    }

    for (current.tankHealer = 0; current.tankHealer < leftover.tankHealer.length; current.tankHealer++) {
        for (current.tankDamage = 0; current.tankDamage < leftover.tankDamage.length; current.tankDamage++) {
            for (current.healerDamage = 0; current.healerDamage < leftover.healerDamage.length; current.healerDamage++) {
                for (current.flexT = 0; current.flexT < leftover.flex.length; current.flexT++) {
                    for (current.flexH = 0; current.flexT + current.flexH < leftover.flex.length; current.flexH++) {
                        setCurrentScore();
                        setCurrentPugs();
                        switch (shouldUpdateBestForPugs()) {
                            case Should.No:
                                continue;
                            // @ts-ignore // switch fallthrough
                            case Should.Maybe:
                                if (current.score > best.score) {
                                    continue;
                                }
                            // eslint-disable-next-line no-fallthrough
                            case Should.Yes:
                                setCurrentAsBest();
                        }
                    }
                }
            }
        }
    }

    // Shuffle (FIXME: use their weights)
    shuffleInPlace(leftover.flex);

    for (let ix = 0; ix < best.tankHealer; ix++) {
        out.tanks.push(leftover.tankHealer[ix]);
    }
    for (let ix = 0; ix < best.tankDamage; ix++) {
        out.tanks.push(leftover.tankDamage[ix]);
    }
    for (let ix = 0; ix < best.flexT; ix++) {
        out.tanks.push(leftover.flex[ix]);
    }

    for (let ix = best.tankHealer; ix < leftover.tankHealer.length; ix++) {
        out.healers.push(leftover.tankHealer[ix]);
    }
    for (let ix = 0; ix < best.healerDamage; ix++) {
        out.healers.push(leftover.healerDamage[ix]);
    }
    for (let ix = best.flexT; ix < best.flexT + best.flexH; ix++) {
        out.healers.push(leftover.flex[ix]);
    }

    for (let ix = best.tankDamage; ix < leftover.tankDamage.length; ix++) {
        out.damage.push(leftover.tankDamage[ix]);
    }
    for (let ix = best.healerDamage; ix < leftover.healerDamage.length; ix++) {
        out.damage.push(leftover.healerDamage[ix]);
    }
    for (let ix = best.flexT + best.flexH; ix < leftover.flex.length; ix++) {
        out.damage.push(leftover.flex[ix]);
    }

    ([out.tanks, out.healers, out.damage])
        .forEach(shuffleInPlace);
    return out;
}

function TeamList({teams: teamSet, hide}: { teams: TeamSet, hide?: boolean }) {
    const teams = useMemo(() => {
        const teams: Array<{
            tank?: Participant,
            healer?: Participant,
            damage1?: Participant,
            damage2?: Participant,
            damage3?: Participant,
        }> = [];
        const teamCount = Math.max(teamSet.tanks.length, teamSet.healers.length, ((teamSet.damage.length + 2) / 3) | 0);
        for (let i = teamCount - 1; i >= 0; i--) {
            teams[i] = {
                tank: teamSet.tanks[i],
                healer: teamSet.healers[teamCount - i],
                damage1: undefined,
                damage2: undefined,
                damage3: undefined,
            };
        }
        for (
            let
                head = 0,
                tail = teamCount - 1,
                flip = false,
                damage1ix = 0,
                damage2ix = teamCount,
                damage3ix = teamCount * 2;
            head <= tail;
        ) {
            flip = !flip;
            if (flip) {
                teams[head].damage1 = teamSet.damage[damage1ix++];
                teams[head].damage2 = teamSet.damage[damage2ix++];
                teams[head].damage3 = teamSet.damage[damage3ix++];
                head += 1;
            } else {
                teams[tail].damage1 = teamSet.damage[damage1ix++];
                teams[tail].damage2 = teamSet.damage[damage2ix++];
                teams[tail].damage3 = teamSet.damage[damage3ix++];
                tail -= 1;
            }
        }
        return teams;
    }, [teamSet]);
    return (<TableContainer className="teamList" component={Paper}>
        <Table size="small">
            <TableHead>
                <TableCell>Tanks</TableCell>
                <TableCell>Healers</TableCell>
                <TableCell colSpan={3}>Damage</TableCell>
            </TableHead>
            <TableBody>
                {teams.map((team, ix) => (<TableRow>
                    <TableCell>{team.tank
                        ? <ParticipantEntry participant={team.tank} rename={hide ? `Tank-${ix + 1}` : undefined}/>
                        : <TravelExploreIcon fontSize="small"/>
                    }</TableCell>
                    <TableCell>{team.healer
                        ? <ParticipantEntry participant={team.healer} rename={hide ? `Healer-${ix + 1}` : undefined}/>
                        : <TravelExploreIcon fontSize="small"/>
                    }</TableCell>
                    <TableCell>{team.damage1
                        ? <ParticipantEntry participant={team.damage1} rename={hide ? `DPS-${ix * 3 + 1}` : undefined}/>
                        : <TravelExploreIcon fontSize="small"/>
                    }</TableCell>
                    <TableCell>{team.damage2
                        ? <ParticipantEntry participant={team.damage2} rename={hide ? `DPS-${ix * 3 + 2}` : undefined}/>
                        : <TravelExploreIcon fontSize="small"/>
                    }</TableCell>
                    <TableCell>{team.damage3
                        ? <ParticipantEntry participant={team.damage3} rename={hide ? `DPS-${ix * 3 + 3}` : undefined}/>
                        : <TravelExploreIcon fontSize="small"/>
                    }</TableCell>
                </TableRow>))}
            </TableBody>
        </Table>
    </TableContainer>);
}

function App(): ReactElement {
    const [list, setList] = useState<Array<Participant>>(sampleData);
    const collected = useMemo(() => settleTeams(list), [list]);
    const [showOutput, setShowOutput] = useState(false);
    const pressShowOutput = useCallback(
        () => {
            setShowOutput((prev) => !prev);
        },
        [setShowOutput],
    );

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline/>
            <Container className="outerBody">
                <Stack
                    className="participantList"
                    maxHeight="100vh"
                    direction="column"
                    useFlexGap
                    flexWrap="wrap"
                    alignContent="start"
                >
                    {
                        list.map((participant: Participant, index: number) => (
                            <ParticipantEntry participant={participant} index={index} setList={setList}/>
                        ))
                    }
                </Stack>
                <TeamList teams={collected} hide={!showOutput}/>

                <InputParticipant setList={setList} showOutput={(
                    <Button
                        variant={showOutput ? 'contained' : 'outlined'}
                        className="participantToggle"
                        onClick={pressShowOutput}
                    >
                        <Switch
                            onSelect={pressShowOutput}
                            color="default"
                            checked={showOutput}
                        />Show Teams
                    </Button>
                )}/>
            </Container>
        </ThemeProvider>
    );
}

export default App;
