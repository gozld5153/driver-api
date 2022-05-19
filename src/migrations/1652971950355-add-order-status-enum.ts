import { MigrationInterface, QueryRunner } from "typeorm";

export class addOrderStatusEnum1652971950355 implements MigrationInterface {
    name = 'addOrderStatusEnum1652971950355'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`status\` enum ('pending', 'driver-matched', 'hero-matched', 'hero-pickuped', 'loaded', 'departed', 'arrived', 'fee-calculated', 'completed', 'canceled') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`status\``);
    }

}
