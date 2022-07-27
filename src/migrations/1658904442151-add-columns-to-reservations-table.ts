import { MigrationInterface, QueryRunner } from "typeorm";

export class addColumnsToReservationsTable1658904442151 implements MigrationInterface {
    name = 'addColumnsToReservationsTable1658904442151'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservations\` ADD \`fee\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`reservations\` ADD \`comment\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservations\` DROP COLUMN \`comment\``);
        await queryRunner.query(`ALTER TABLE \`reservations\` DROP COLUMN \`fee\``);
    }

}
