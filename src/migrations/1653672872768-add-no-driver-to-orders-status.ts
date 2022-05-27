import { MigrationInterface, QueryRunner } from "typeorm";

export class addNoDriverToOrdersStatus1653672872768 implements MigrationInterface {
    name = 'addNoDriverToOrdersStatus1653672872768'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`status\` \`status\` enum ('pending', 'no-driver', 'driver-matched', 'hero-matched', 'hero-pickuped', 'loaded', 'departed', 'arrived', 'fee-calculated', 'completed', 'canceled') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`status\` \`status\` enum ('pending', 'driver-matched', 'hero-matched', 'hero-pickuped', 'loaded', 'departed', 'arrived', 'fee-calculated', 'completed', 'canceled') NOT NULL`);
    }

}
