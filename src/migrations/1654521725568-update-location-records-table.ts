import { MigrationInterface, QueryRunner } from "typeorm";

export class updateLocationRecordsTable1654521725568 implements MigrationInterface {
    name = 'updateLocationRecordsTable1654521725568'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`location_records\` DROP COLUMN \`latitude\``);
        await queryRunner.query(`ALTER TABLE \`location_records\` ADD \`latitude\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`location_records\` DROP COLUMN \`longitude\``);
        await queryRunner.query(`ALTER TABLE \`location_records\` ADD \`longitude\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`location_records\` DROP COLUMN \`longitude\``);
        await queryRunner.query(`ALTER TABLE \`location_records\` ADD \`longitude\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`location_records\` DROP COLUMN \`latitude\``);
        await queryRunner.query(`ALTER TABLE \`location_records\` ADD \`latitude\` int NOT NULL`);
    }

}
