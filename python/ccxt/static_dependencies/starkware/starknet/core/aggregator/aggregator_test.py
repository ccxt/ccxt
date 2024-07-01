from starkware.starknet.core.aggregator.output_parser import (
    ContractChanges,
    OsOutput,
    parse_bootloader_output,
)

# Dummy values for the test.
OS_PROGRAM_HASH = 0x7E0B89C77D0003C05511B9F0E1416F1328C2132E41E056B2EF3BC950135360F
OS_CONFIG_HASH = 0x3410F9DCE5078BFA24B30F28F9F9107A995E5F339334A7126730A993045681
BLOCK0_HASH = 0x1C5CA4BCC4C03D843B8C08F9C8628BA7A108D2B62F4C0F6EF224F250679230E
BLOCK1_HASH = 0x378294C261592B32272381910BCB2402A864E1CDF68EDC855CAA24CACF68B65
ROOT0 = 0
ROOT1 = 0x3BCBB6FD22F39E772ACE7F905AC64FBF6D7139CAC2C44189D59B37618BB62D0
ROOT2 = 0x269DDFB6E729A030E3513A7E8208D68BE9AB97852681FB531E7FC69FAC2852A

CONTRACT_ADDR0 = 0x42593E24F58291B1D7E4FD081AE6DD88D0B198E23C3F722E7E5A7A4C7BCD3D5
CLASS_HASH = 0x178286A1179F01D8A55F34B8CC651C7DD7B298B222A392197E703C3F8E161DE
STORAGE_KEY0 = 0xB6CE5410FCA59D078EE9B2A4371A9D684C530D697C64FBEF0AE6D5E8F0AC72
STORAGE_KEY1 = 0x110E2F729C9C2B988559994A3DACCD838CF52FAF88E18101373E67DD061455A
STORAGE_KEY2 = 0x1390569BB0A3A722EB4228E8700301347DA081211D5C2DED2DB22EF389551AB
STORAGE_KEY3 = 0x124A17A64F318C191BAB4FEEEDA0A65B420FF92861FFB021759F05A2598ABF

STORAGE_VALUE0_0 = 0x15A44BFBB65C4961F54BC84CADBFC542AA8529E293E9FD7D45E3008DD75F376
STORAGE_VALUE0_1 = 0x31F90D664D5604B8B38C9C442B005B7E41BDA662E6E15A7364220D633153F35
STORAGE_VALUE1_0 = 0x2456E7A60B3AB8B28E9AB0D9FBF0D437CCDDC9776664AF33FFD6506FC1AB8E1
STORAGE_VALUE2_0 = 0x20E9DCD4DDB159970BD2D51075C8CC823E68BB04777FABB65879E0EA455AEE1
STORAGE_VALUE3_1 = 0x3C87090C322CC7E56F05DA6AEE18B28F8DD98A787F5280BD9469B00E08AFC43

MSG_TO_L1_0 = [
    0x3F9A3CD755E1C8D50080AE5C76CACB1C6CACDCDF1C467C9F0A0ABDB684A6E3D,
    0x3795FD47F065CF5541F0EA7D9702450F09898EF7,
    2,
    12,
    34,
]
MSG_TO_L2_0 = [
    0x3795FD47F065CF5541F0EA7D9702450F09898EF7,
    0x3F9A3CD755E1C8D50080AE5C76CACB1C6CACDCDF1C467C9F0A0ABDB684A6E3D,
    2,
    0,
    1,
    0x1234,
]

BLOCK0_OUTPUT = [
    # initial_root.
    ROOT0,
    # final_root.
    ROOT1,
    # block_number.
    1,
    # block_hash.
    BLOCK0_HASH,
    OS_CONFIG_HASH,
    # use_kzg_da.
    0,
    # Messages to L1.
    len(MSG_TO_L1_0),
    *MSG_TO_L1_0,
    # Messages to L2.
    len(MSG_TO_L2_0),
    *MSG_TO_L2_0,
    # Number of contracts.
    1,
    # Contract addr.
    CONTRACT_ADDR0,
    # 3 updates, nonce=1, class updated.
    3 + 1 * 2**64 + 1 * 2**128,
    # Class hash.
    CLASS_HASH,
    # Storage updates.
    STORAGE_KEY0,
    STORAGE_VALUE0_0,
    STORAGE_KEY1,
    STORAGE_VALUE1_0,
    STORAGE_KEY2,
    STORAGE_VALUE2_0,
    # Number of classes.
    0,
]

BLOCK1_OUTPUT = [
    # initial_root.
    ROOT1,
    # final_root.
    ROOT2,
    # block_number.
    2,
    # block_hash.
    BLOCK1_HASH,
    OS_CONFIG_HASH,
    # use_kzg_da.
    0,
    # Messages to L1.
    0,
    # Messages to L2.
    0,
    # Number of contracts.
    1,
    # Contract addr.
    CONTRACT_ADDR0,
    # 2 updates, nonce=2, no class update.
    2 + 2 * 2**64 + 0 * 2**128,
    STORAGE_KEY0,
    STORAGE_VALUE0_1,
    STORAGE_KEY3,
    STORAGE_VALUE3_1,
    # Number of classes.
    0,
]

BOOTLOADER_OUTPUT = [
    # Number of blocks.
    2,
    len(BLOCK0_OUTPUT) + 2,
    OS_PROGRAM_HASH,
    *BLOCK0_OUTPUT,
    len(BLOCK1_OUTPUT) + 2,
    OS_PROGRAM_HASH,
    *BLOCK1_OUTPUT,
]


def test_output_parser():
    assert parse_bootloader_output(output=BOOTLOADER_OUTPUT) == [
        OsOutput(
            initial_root=ROOT0,
            final_root=ROOT1,
            block_number=1,
            block_hash=BLOCK0_HASH,
            starknet_os_config_hash=OS_CONFIG_HASH,
            use_kzg_da=0,
            messages_to_l1=MSG_TO_L1_0,
            messages_to_l2=MSG_TO_L2_0,
            contracts=[
                ContractChanges(
                    addr=CONTRACT_ADDR0,
                    nonce=1,
                    class_hash=CLASS_HASH,
                    storage_changes={
                        STORAGE_KEY0: STORAGE_VALUE0_0,
                        STORAGE_KEY1: STORAGE_VALUE1_0,
                        STORAGE_KEY2: STORAGE_VALUE2_0,
                    },
                )
            ],
            classes={},
        ),
        OsOutput(
            initial_root=ROOT1,
            final_root=ROOT2,
            block_number=2,
            block_hash=BLOCK1_HASH,
            starknet_os_config_hash=OS_CONFIG_HASH,
            use_kzg_da=0,
            messages_to_l1=[],
            messages_to_l2=[],
            contracts=[
                ContractChanges(
                    addr=CONTRACT_ADDR0,
                    nonce=2,
                    class_hash=None,
                    storage_changes={
                        STORAGE_KEY0: STORAGE_VALUE0_1,
                        STORAGE_KEY3: STORAGE_VALUE3_1,
                    },
                )
            ],
            classes={},
        ),
    ]
